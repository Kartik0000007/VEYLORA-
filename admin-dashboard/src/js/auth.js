// Auth helpers for Veylora Admin Dashboard

function requireAuth() {
  const token = localStorage.getItem('veylora_admin_token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function getCurrentUser() {
  const raw = localStorage.getItem('veylora_admin_user');
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem('veylora_admin_token');
  localStorage.removeItem('veylora_admin_user');
  window.location.href = 'login.html';
}

window.requireAuth = requireAuth;
window.getCurrentUser = getCurrentUser;
window.logout = logout;
