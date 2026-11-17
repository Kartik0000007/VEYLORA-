/**
 * Database migration runner for Veylora.
 *
 * Applies SQL migration files from database/migrations/ in sorted order,
 * tracking which have already been applied in the schema_migrations table.
 * All migrations are additive and preserve existing data.
 */

require('dotenv').config();
const { query } = require('../src/models/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  // Create migrations tracking table (idempotent)
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const executed = await query('SELECT filename FROM schema_migrations');
  const executedSet = new Set(executed.rows.map((r) => r.filename));

  let applied = 0;
  for (const file of files) {
    if (executedSet.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await query(sql);
    await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    console.log(`Applied migration: ${file}`);
    applied += 1;
  }

  if (applied === 0) {
    console.log('No new migrations to apply.');
  } else {
    console.log(`Migrations complete. Applied ${applied} migration(s).`);
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
