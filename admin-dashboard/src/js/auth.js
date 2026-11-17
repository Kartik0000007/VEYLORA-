// Auth helpers for Veylora Admin Dashboard
// Uses HttpOnly cookie-based authentication. Tokens are never stored in
// localStorage. Session validity is verified via /api/auth/me.

(function () {
  const LOGIN_URL = 'login.html';

  async function requireAuth() {
    try {
      const res = await api.get('/api/auth/me');
      if (res && res.user) {
        return true;
      }
    } catch (err) {
      // 401 / 403 / expired / invalid token — redirect to login
      if (err.status === 401 || err.status === 403) {
        clearAuthState();
        window.location.href = LOGIN_URL;
        return false;
      }
    }

    // Network error or unexpected response — still redirect to be safe
    clearAuthState();
    window.location.href = LOGIN_URL;
    return false;
  }

  async function checkAuth() {
    // Lightweight check without redirecting. Returns user or null.
    try {
      const res = await api.get('/api/auth/me');
      return res && res.user ? res.user : null;
    } catch {
      return null;
    }
  }

  function clearAuthState() {
    // HttpOnly cookies are cleared by the server on /api/auth/logout.
    // No localStorage tokens to clear here.
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors — clear state anyway
    }
    clearAuthState();
    window.location.href = LOGIN_URL;
  }

  function getCsrfToken() {
    const name = 'XSRF-TOKEN';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  window.requireAuth = requireAuth;
  window.checkAuth = checkAuth;
  window.logout = logout;
  window.getCsrfToken = getCsrfToken;
  window.clearAuthState = clearAuthState;
})();
