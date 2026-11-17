require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { config, isProduction } = require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error');
const { authenticateToken } = require('./middleware/auth');
const { csrfProtection } = require('./middleware/csrf');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimit');
const { healthCheck, closePool } = require('./models/db');

const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = config.port;

// ---------------------------------------------------------------------------
// Production environment validation — fail fast if required config is missing
// ---------------------------------------------------------------------------
if (isProduction) {
  if (!config.databaseUrl) {
    console.error('FATAL: DATABASE_URL is required in production');
    process.exit(1);
  }
  if (
    !config.jwtSecret ||
    config.jwtSecret === 'your-super-secret-jwt-key-change-in-production'
  ) {
    console.error('FATAL: JWT_SECRET must be changed in production');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// CORS with explicitly approved frontend origins
const corsOrigin =
  config.corsOrigin.length > 0 ? config.corsOrigin : '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Body parsing and cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);

// ---------------------------------------------------------------------------
// Health check — verifies database connectivity
// ---------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const dbHealth = await healthCheck();
  res.json({
    status: dbHealth.connected ? 'ok' : 'degraded',
    service: 'veylora-backend',
    environment: config.nodeEnv,
    timestamp: dbHealth.timestamp,
    database: dbHealth.connected ? 'connected' : 'disconnected',
    ...(!dbHealth.connected && { error: dbHealth.error }),
  });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------------
// Global error handler (no stack traces in production)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Server startup with graceful shutdown
// ---------------------------------------------------------------------------
let server;

async function start() {
  server = app.listen(PORT, () => {
    console.log(`Veylora backend running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

// Only start when run directly, not when required as a module (e.g. in tests)
if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  try {
    await closePool();
    console.log('Database pool closed');
  } catch (err) {
    console.error('Error closing database pool:', err.message);
  }
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
