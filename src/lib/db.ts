import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Valida de forma estricta si una cadena de conexión corresponde a PostgreSQL.
 * Rechaza esquemas incompatibles (como sqlite:, mysql:, etc.) para evitar que
 * la librería `pg` (node-postgres) intente conectarse por defecto a 127.0.0.1:5432
 * y bloquee el hilo con errores ECONNREFUSED.
 */
export function isPostgresUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://");
}

/**
 * Determina si el entorno actual cuenta con una variable DATABASE_URL
 * con esquema PostgreSQL válido.
 */
export function isDatabaseConfigured(): boolean {
  return isPostgresUrl(process.env.DATABASE_URL);
}

const getPool = () => {
  if (pool) return pool;

  const raw = process.env.DATABASE_URL;
  if (!raw || !raw.trim()) {
    throw new Error("DATABASE_URL debe configurarse para acceder a la base de datos.");
  }

  const connectionString = raw.trim();
  if (!isPostgresUrl(connectionString)) {
    throw new Error(
      `DATABASE_URL no tiene un esquema PostgreSQL válido (debe iniciar con postgres:// o postgresql://). Rechazado preventivamente para evitar conexión fallida a 127.0.0.1:5432 (ECONNREFUSED).`
    );
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("render.com") || connectionString.includes("dpg-")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 5000, // Timeout de 5s para fail-fast ante caídas o reposo
    statement_timeout: 8000,
    keepAlive: true,
  });

  pool.on("error", (error) => {
    console.error("[DB] Se cortó o falló una conexión en el pool:", error.message);
  });

  return pool;
};

export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const activePool = getPool();
  try {
    // pool.query adquiere un cliente del pool y garantiza liberarlo inmediatamente al terminar o fallar
    const res = await activePool.query(text, params);
    return res.rows;
  } catch (error: any) {
    console.error("[DB Query Error]:", error?.message || error);
    throw error;
  }
}

export default pool;
