// API client for Veylora Admin Dashboard
const API_BASE = process.env.API_BASE || window.location.origin.includes('vercel.app')
  ? 'https://veylora-backend.onrender.com'  // Change this to your Render/Railway URL
  : 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('veylora_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

window.api = api;
