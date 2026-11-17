/**
 * Veylora Admin Dashboard — Runtime Configuration
 *
 * Reads API base URL from a data attribute on the script tag that loads this
 * file, falling back to sensible defaults for local development.
 *
 * Usage in HTML:
 *   <script src="src/js/config.js" data-api-base="https://api.veylora.example.com"></script>
 */

(function () {
  const scriptEl = document.currentScript;
  const dataApiBase = scriptEl && scriptEl.getAttribute('data-api-base');

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const config = {
    API_BASE:
      dataApiBase ||
      (isLocalhost ? 'http://localhost:5000' : window.location.origin),
    COOKIE_NAME: 'veylora_session',
    CSRF_COOKIE_NAME: 'XSRF-TOKEN',
  };

  window.VEYLORA_CONFIG = config;
})();
