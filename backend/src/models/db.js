const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL idle client error', err.message);
  process.exit(-1);
});

async function healthCheck() {
  try {
    await pool.query('SELECT 1 AS connected');
    return { connected: true, timestamp: new Date().toISOString() };
  } catch (err) {
    return { connected: false, error: err.message, timestamp: new Date().toISOString() };
  }
}

async function closePool() {
  await pool.end();
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  healthCheck,
  closePool,
};
