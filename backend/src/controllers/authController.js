const { query } = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
};

function clearSessionCookies(res) {
  res.clearCookie('veylora_session', { path: '/' });
  res.clearCookie('XSRF-TOKEN', { path: '/' });
}

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await query(
      'SELECT * FROM admins WHERE username = $1 AND is_active = TRUE',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenVersion = admin.token_version || 0;
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, v: tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const csrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie('veylora_session', token, COOKIE_OPTIONS);
    res.cookie('XSRF-TOKEN', csrfToken, CSRF_COOKIE_OPTIONS);

    res.json({
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      csrfToken,
    });
  },

  // GET /api/auth/me (verify token)
  async me(req, res) {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
    });
  },

  // POST /api/auth/logout
  async logout(req, res) {
    clearSessionCookies(res);
    res.json({ message: 'Logged out successfully' });
  },

  // POST /api/auth/password-change
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const adminId = req.user.id;
    const result = await query(
      'SELECT password_hash, token_version FROM admins WHERE id = $1 AND is_active = TRUE',
      [adminId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const newTokenVersion = (admin.token_version || 0) + 1;

    await query(
      `UPDATE admins
       SET password_hash = $1, token_version = $2, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [passwordHash, newTokenVersion, adminId]
    );

    // Invalidate all existing sessions by clearing cookies
    clearSessionCookies(res);

    res.json({ message: 'Password changed successfully. Please log in again.' });
  },
};

module.exports = authController;
