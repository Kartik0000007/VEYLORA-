/**
 * Authentication middleware for Veylora backend.
 *
 * Verifies the JWT stored in the HttpOnly `veylora_session` cookie.
 * On every request, validates the token version against the admin record
 * so that password changes immediately invalidate all existing sessions.
 */

const jwt = require('jsonwebtoken');
const { query } = require('../models/db');

const authenticateToken = async (req, res, next) => {
  const token = req.cookies && req.cookies['veylora_session'];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the admin still exists and is active
    const result = await query(
      'SELECT id, username, role, is_active, token_version FROM admins WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Token invalidation: password change increments token_version
    if ((decoded.v || 0) !== (admin.token_version || 0)) {
      return res.status(401).json({ error: 'Token invalidated. Please log in again.' });
    }

    req.user = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };
