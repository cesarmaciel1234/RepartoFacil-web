import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://crm_libro_local_user:9WwQafiM47vLUUezeXbRGvd1xUk8GRrA@dpg-dbti1sjm8hqs73b0adc0-a.oregon-postgres.render.com/crm_libro_local";

// En Render interno o externo, SSL rejectUnauthorized false permite conectar de forma segura
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("render.com") || connectionString.includes("dpg-")
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export default pool;
