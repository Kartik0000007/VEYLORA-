// API client for Veylora Admin Dashboard
// Uses HttpOnly cookie-based authentication (veylora_session) and
// double-submit CSRF protection (XSRF-TOKEN cookie + X-XSRF-TOKEN header).
// No authentication tokens are stored in localStorage.

(function () {
  const config = window.VEYLORA_CONFIG || { API_BASE: window.location.origin };

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add CSRF token for state-changing requests
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      (options.method || 'GET').toUpperCase()
    );
    if (isStateChanging) {
      const csrfToken = getCookie(config.CSRF_COOKIE_NAME);
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    // Always send credentials so HttpOnly cookies are included
    const res = await fetch(`${config.API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const err = new Error(data?.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  const api = {
    get: (path) => request(path),
    post: (path, body) =>
      request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) =>
      request(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body) =>
      request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
  };

  window.api = api;
  window.VEYLORA_API_BASE = config.API_BASE;
})();
