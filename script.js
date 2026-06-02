/**
 * script.js — GabutStore Web Panel
 * Shared utilities: API fetch, alert, helpers
 */

// ─────────────────────────────────────────────
// CONFIG — ganti BASE_URL ke URL VPS kamu
// Contoh: 'https://your-vps-ip:50123'
//         'https://api.gabutstore.xyz'
// ─────────────────────────────────────────────
const BASE_URL = 'http://sgxt3.isdarprem.net:50123';

/**
 * apiFetch — wrapper fetch ke VPS
 * Otomatis inject token dari localStorage
 */
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('gs_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers
  });

  // Token expired / invalid → logout
  if (res.status === 401) {
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_email');
    window.location.href = 'login.html';
    return;
  }

  return res.json();
}

/**
 * showAlert — tampilkan pesan di #alert-box
 */
function showAlert(message, type = 'info') {
  const box = document.getElementById('alert-box');
  if (!box) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  box.innerHTML = `
    <div class="alert alert-${type}">
      ${icons[type] || ''} ${message}
    </div>
  `;

  // Auto-dismiss success/info setelah 4 detik
  if (type !== 'error') {
    setTimeout(() => { box.innerHTML = ''; }, 4000);
  }
}

/**
 * clearAlert — hapus pesan alert
 */
function clearAlert() {
  const box = document.getElementById('alert-box');
  if (box) box.innerHTML = '';
}

/**
 * formatRp — format angka ke Rupiah
 */
function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
