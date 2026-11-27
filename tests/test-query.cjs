const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query("DELETE FROM local_users WHERE email LIKE 'test_driver_%'");
  console.log('Cleaned test drivers:', res.rowCount);
  await pool.end();
}

main().catch(console.error);
