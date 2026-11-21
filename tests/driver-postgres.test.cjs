const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { randomBytes } = require("node:crypto");
const { Pool } = require("pg");
const ts = require("typescript");
const dotenv = require("dotenv");

test("asignación concurrente y entrega idempotente en PostgreSQL", {
  skip: process.env.RF_RUN_POSTGRES_TEST !== "1",
}, async () => {
  const envFile = process.env.RF_DATABASE_ENV_FILE;
  assert.ok(envFile, "Indicá RF_DATABASE_ENV_FILE para la base autorizada.");
  const env = {};
  const loaded = dotenv.config({ path: envFile, processEnv: env, quiet: true });
  assert.ok(!loaded.error && env.DATABASE_URL, "No se pudo leer DATABASE_URL.");

  const connectionString = env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("render.com") || connectionString.includes("dpg-")
      ? { rejectUnauthorized: false } : undefined,
    max: 5,
    connectionTimeoutMillis: 10000,
  });
  const schema = `rf_test_${randomBytes(12).toString("hex")}`;
  const quotedSchema = `"${schema}"`;
  let created = false;

  const safeQuery = async (client, sql, values) => {
    try {
      return await client.query(sql, values);
    } catch (error) {
      throw new Error(`Falló una consulta de prueba: ${error.code || "error de conexión"}`);
    }
  };
  const queryDb = async (sql, values) => {
    const client = await pool.connect();
    try {
      await safeQuery(client, `SET search_path TO ${quotedSchema}`);
      return (await safeQuery(client, sql, values)).rows;
    } finally {
      client.release();
    }
  };

  try {
    const admin = await pool.connect();
    try {
      await safeQuery(admin, `CREATE SCHEMA ${quotedSchema}`);
      created = true;
      await safeQuery(admin, `CREATE TABLE ${quotedSchema}.repartofacil_pedidos (
        id text PRIMARY KEY, estado text, repartidor_id text, repartidor_usuario_id text,
        repartidor_nombre text, updated_at timestamptz, driver_last_ping timestamptz,
        custodio_estado text, custodio_advertencia_at timestamptz, ticket_id text,
        created_at timestamptz, cliente_nombre text, direccion_entrega text,
        items jsonb, total numeric, ganancia_repartidor numeric, metodo_pago text
      )`);
      await safeQuery(admin, `CREATE TABLE ${quotedSchema}.repartofacil_chat_mensajes (
        id text PRIMARY KEY, order_id text, author_role text, author_name text,
        content text, timestamp_str text, created_at timestamptz, author_id text
      )`);
      await safeQuery(admin, `INSERT INTO ${quotedSchema}.repartofacil_pedidos
        (id, estado, cliente_nombre, direccion_entrega, items, total, ganancia_repartidor, metodo_pago, created_at)
        VALUES ('TEST-ISOLATED', 'ready', 'Cliente ficticio', 'Dirección ficticia', '[]', 1000, 0, 'cash', NOW())`);
    } finally {
      admin.release();
    }

    const source = fs.readFileSync(path.join(process.cwd(), "src/app/api/orders/route.ts"), "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, {
      exports, console, process: { env: { RF_DRIVER_ACTIONS_LEGACY_COMPAT: "1" } },
      require(name) {
        if (name === "next/server") {
          return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } };
        }
        if (name === "@/lib/db") return { queryDb };
        if (name === "@/lib/custodio") return { ejecutarAuditoriaCustodio: async () => {} };
        throw new Error(`Dependencia inesperada: ${name}`);
      },
    });
    const request = (status, driverId, driverProtocol = 2, id = "TEST-ISOLATED") => ({
      json: async () => ({ id, status, driverId, driverProtocol }),
    });
    const results = await Promise.all([
      exports.PATCH(request("Assigned", "test-driver-1")),
      exports.PATCH(request("Assigned", "test-driver-2")),
    ]);
    assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
    const winner = results.find((result) => result.status === 200).body.driverId;
    const loser = winner === "test-driver-1" ? "test-driver-2" : "test-driver-1";
    assert.equal((await exports.PATCH(request("Assigned", winner))).status, 200);
    assert.equal((await exports.PATCH(request("Delivered", loser))).status, 409);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const delivered = await exports.PATCH(request("Delivered", winner));
    assert.equal(delivered.status, 200);
    assert.equal(delivered.body.driverSettlement.earning, 0);
    assert.equal((await exports.PATCH(request("Delivered", winner))).status, 200);
    assert.equal((await exports.PATCH(request("Delivered"))).status, 400);
    const events = await queryDb("SELECT COUNT(*)::integer AS count FROM repartofacil_chat_mensajes");
    assert.equal(events[0].count, 2);
    await queryDb(`INSERT INTO repartofacil_pedidos
      (id, estado, cliente_nombre, direccion_entrega, items, total, ganancia_repartidor, metodo_pago, created_at)
      VALUES ('TEST-LEGACY', 'Assigned', 'Cliente ficticio', 'Dirección ficticia', '[]', 1000, 100, 'cash', NOW())`);
    const legacy = { json: async () => ({ id: "TEST-LEGACY", status: "Delivered" }) };
    assert.equal((await exports.PATCH(legacy)).status, 200);
  } finally {
    if (created) {
      const admin = await pool.connect();
      try {
        const objects = await safeQuery(admin, `
          SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = $1 AND c.relkind IN ('r', 'p')`, [schema]);
        const allowed = new Set(["repartofacil_pedidos", "repartofacil_chat_mensajes"]);
        if (objects.rows.some((row) => !allowed.has(row.relname))) {
          throw new Error(`Se conservó el esquema de prueba ${schema} por contener tablas inesperadas.`);
        }
        await safeQuery(admin, `DROP SCHEMA ${quotedSchema} CASCADE`);
      } catch (error) {
        console.error(`No se pudo limpiar el esquema de prueba ${schema}.`);
        throw error;
      } finally {
        admin.release();
        await pool.end();
      }
    } else {
      await pool.end();
    }
  }
});
