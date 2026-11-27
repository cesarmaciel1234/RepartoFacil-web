const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const usuarios = await pool.query("SELECT * FROM usuarios");
    console.log('--- USUARIOS TPV ---');
    console.log(JSON.stringify(usuarios.rows, null, 2));

    const posBase = await pool.query("SELECT id, empresa_id, sucursal_id, tabla, actualizado_en FROM pos_base WHERE empresa_id = 1");
    console.log('--- POS_BASE (empresa_id = 1) ---');
    console.log(JSON.stringify(posBase.rows, null, 2));

    const posBaseProductos = await pool.query("SELECT id, empresa_id, sucursal_id, tabla, columnas, filas FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos'");
    console.log('--- POS_BASE PRODUCTOS ---');
    if (posBaseProductos.rows.length > 0) {
      const row = posBaseProductos.rows[0];
      const cols = typeof row.columnas === 'string' ? JSON.parse(row.columnas) : row.columnas;
      const filas = typeof row.filas === 'string' ? JSON.parse(row.filas) : row.filas;
      console.log('Columnas:', cols);
      console.log('Filas (primeras 5):', filas.slice(0, 5));
    }
  } finally {
    await pool.end();
  }
}
main().catch(console.error);
