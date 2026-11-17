/**
 * Database seed script for Veylora.
 *
 * Provisions the initial administrator account using environment variables.
 * Never hardcodes credentials; ADMIN_PASSWORD must be provided via .env.
 * Idempotent: uses ON CONFLICT DO NOTHING on username.
 */

require('dotenv').config();
const { query } = require('../src/models/db');
const bcrypt = require('bcryptjs');

async function seed() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@veylora.local';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('FATAL: ADMIN_PASSWORD environment variable is required for seeding');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await query(
    `INSERT INTO admins (username, email, password_hash, role, is_active, token_version)
     VALUES ($1, $2, $3, 'admin', TRUE, 0)
     ON CONFLICT (username)
     DO UPDATE SET
       email = EXCLUDED.email,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       is_active = EXCLUDED.is_active,
       updated_at = CURRENT_TIMESTAMP`,
    [adminUsername, adminEmail, passwordHash]
  );

  console.log(`Seed complete. Administrator account ready: ${adminUsername}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
