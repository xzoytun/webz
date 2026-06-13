// Cek sesi aktif sebelum merender halaman login
(function checkActiveSession() {
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  if (savedUser && savedToken && window.location.pathname.includes('index.html')) {
    window.location.href = 'dashboard.html';
  }
})();

// SVG Icons untuk Status Box info login
const svgLoading = `<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
const svgSuccess = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const svgError   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

// ==================== OAUTH GOOGLE HANDLER ====================
async function handleCredentialResponse(response) {
  const message = document.getElementById('message');
  
  if (message) {
    message.className = 'loading';
    message.innerHTML = `${svgLoading} <span>Memproses login Google...</span>`;
  }

  try {
    const res = await fetch('/api/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        credential: response.credential
      })
    });

    const result = await res.json();

    if (result.success) {
      // Simpan objek user fresh hasil response backend (bawa data last_login asli database)
      localStorage.setItem('user', JSON.stringify(result.user));
      // Simpan token JWT bawaan server backend
      localStorage.setItem('token', result.token);

      if (message) {
        message.className = 'success';
        message.innerHTML = `${svgSuccess} <span>Login berhasil, mengalihkan...</span>`;
      }

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } else {
      if (message) {
        message.className = 'error';
        message.innerHTML = `${svgError} <span>${result.message || 'Login Google gagal'}</span>`;
      }
    }

  } catch (err) {
    console.error(err);
    if (message) {
      message.className = 'error';
      message.innerHTML = `${svgError} <span>Server tidak dapat dihubungi</span>`;
    }
  }
}

// ==================== DASHBOARD GUARD CLIENT-SIDE ====================
document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const roleEl = document.getElementById('role');

  // Hanya berjalan di halaman yang memiliki elemen ID 'username' (seperti dashboard.html)
  if (usernameEl) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      window.location.href = 'index.html';
    } else {
      usernameEl.innerText = user.username || '-';
      if (emailEl) emailEl.innerText = user.email || '-';
      if (roleEl) roleEl.innerText = user.role || 'user';
    }
  }
});

// ==================== GLOBAL LOGOUT FUNCTION ====================
function logout() {
  localStorage.clear(); // Bersihkan semua key storage agar aman
  window.location.href = 'index.html';
}
