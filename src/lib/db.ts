import { Pool } from "pg";

let pool: Pool | null = null;

const getPool = () => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL debe configurarse para acceder a la base de datos.");
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("render.com") || connectionString.includes("dpg-")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return pool;
};

export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export default pool;
