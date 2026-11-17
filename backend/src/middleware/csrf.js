/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * After login, a non-HttpOnly XSRF-TOKEN cookie is set. The
 * frontend reads it and sends it back as the X-XSRF-TOKEN header
 * on every state-changing request (POST/PUT/DELETE/PATCH).
 * The middleware verifies the header matches the cookie.
 *
 * Safe methods (GET/HEAD/OPTIONS) are exempt.
 */

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const csrfProtection = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies && req.cookies['XSRF-TOKEN'];
  const csrfHeader =
    req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  next();
};

module.exports = { csrfProtection };
