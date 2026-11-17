/**
 * Veylora Backend Environment Configuration
 *
 * Centralised, validated environment configuration.
 * Fails fast in production when required variables are missing.
 */

require('dotenv').config();

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
  apiBase: process.env.API_BASE || 'http://localhost:5000',
  adminUsername: process.env.ADMIN_USERNAME,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  publishWebhookSecret: process.env.PUBLISH_WEBHOOK_SECRET,
  cookieSecure: isProduction,
  cookieSameSite: isProduction ? 'None' : 'Lax',
};

module.exports = { config, requiredEnv, isProduction };
