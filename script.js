// ===== KONFIGURASI =====
const API_BASE = '/api';
const STORE_NAME = 'GabutStore'; // Sesuaikan dengan NAMA_STORE di .vars.json

// ===== UTILS =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `show toast-${type}`;
  setTimeout(() => { t.className = ''; }, 3500);
}

function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => { el.classList.remove('show'); }, 5000);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> Memproses...'
    : btn.dataset.label;
}

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Berhasil disalin!'));
}

// ===== AUTH HELPERS =====
function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}
function setUser(u) { localStorage.setItem('user', JSON.stringify(u)); }
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}
function requireAuth() {
  if (!getToken()) { window.location.href = '/login.html'; return false; }
  return true;
}
function redirectIfLoggedIn() {
  if (getToken()) { window.location.href = '/panel.html'; }
}

// ===== API FETCH WRAPPER =====
async function api(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + endpoint, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

// ===== HALAMAN: LOGIN =====
function initLogin() {
  redirectIfLoggedIn();
  const form = document.getElementById('loginForm');
  if (!form) return;

  const btn = document.getElementById('loginBtn');
  btn.dataset.label = btn.innerHTML;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return showAlert('loginAlert', 'Username dan password wajib diisi');

    setLoading('loginBtn', true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      setToken(data.token);
      setUser(data.user);
      showToast('Login berhasil! Mengalihkan...');
      setTimeout(() => { window.location.href = '/panel.html'; }, 800);
    } catch (err) {
      showAlert('loginAlert', err.message);
    } finally {
      setLoading('loginBtn', false);
    }
  });
}

// ===== HALAMAN: REGISTER =====
function initRegister() {
  redirectIfLoggedIn();
  const form = document.getElementById('registerForm');
  if (!form) return;

  const btn = document.getElementById('registerBtn');
  btn.dataset.label = btn.innerHTML;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    const whatsapp = document.getElementById('whatsapp').value.trim();

    if (!username || !email || !password) return showAlert('registerAlert', 'Semua field wajib diisi');
    if (password !== confirm) return showAlert('registerAlert', 'Password tidak cocok');
    if (password.length < 6) return showAlert('registerAlert', 'Password minimal 6 karakter');

    setLoading('registerBtn', true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: { username, email, password, whatsapp },
      });
      showAlert('registerAlert', 'Registrasi berhasil! Cek email untuk verifikasi. Mengalihkan ke login...', 'success');
      setTimeout(() => { window.location.href = '/login.html'; }, 2500);
    } catch (err) {
      showAlert('registerAlert', err.message);
    } finally {
      setLoading('registerBtn', false);
    }
  });
}

// ===== HALAMAN: PANEL / DASHBOARD =====
async function initPanel() {
  if (!requireAuth()) return;

  // Sidebar toggle (mobile)
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Set user info
  const user = getUser();
  if (user) {
    document.querySelectorAll('.user-name').forEach(el => { el.textContent = user.username || '-'; });
    document.querySelectorAll('.user-role').forEach(el => { el.textContent = user.role === 'reseller' ? '⭐ Reseller' : '👤 Member'; });
  }

  // Load data sesuai halaman aktif
  const page = document.body.dataset.page;
  if (page === 'dashboard') await loadDashboard();
  if (page === 'akun') await loadAkun();
  if (page === 'deposit') await loadDeposit();
  if (page === 'beli') await loadProduk();
  if (page === 'transaksi') await loadTransaksi();
  if (page === 'profil') await loadProfil();
  if (page === 'ppob') await loadPPOB();
}

// --- DASHBOARD ---
async function loadDashboard() {
  try {
    const data = await api('/user/dashboard');
    // Saldo
    const saldo = document.getElementById('userSaldo');
    if (saldo) saldo.textContent = formatRupiah(data.saldo || 0);
    // Total akun aktif
    const totalAkun = document.getElementById('totalAkun');
    if (totalAkun) totalAkun.textContent = data.total_akun || 0;
    // Total transaksi
    const totalTrx = document.getElementById('totalTrx');
    if (totalTrx) totalTrx.textContent = data.total_transaksi || 0;

    // Transaksi terbaru
    if (data.transaksi_terbaru) renderTransaksiMini(data.transaksi_terbaru);
    // Akun terbaru
    if (data.akun_terbaru) renderAkunMini(data.akun_terbaru);
  } catch (err) {
    showToast('Gagal memuat dashboard: ' + err.message, 'error');
  }
}

function renderTransaksiMini(list) {
  const el = document.getElementById('trxList');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:20px">Belum ada transaksi</td></tr>'; return; }
  el.innerHTML = list.map(t => `
    <tr>
      <td>${formatDate(t.created_at)}</td>
      <td>${t.type === 'topup' ? '💰 Deposit' : t.type === 'purchase' ? '🛒 Pembelian' : t.type}</td>
      <td class="${t.amount > 0 ? 'text-green' : 'text-red'}">${t.amount > 0 ? '+' : ''}${formatRupiah(t.amount)}</td>
      <td><span class="status status-active">✓</span></td>
    </tr>
  `).join('');
}

function renderAkunMini(list) {
  const el = document.getElementById('akunList');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:20px">Belum ada akun aktif</td></tr>'; return; }
  el.innerHTML = list.map(a => {
    const exp = new Date(a.expired_at);
    const isExpired = exp < new Date();
    return `
      <tr>
        <td>${a.username}</td>
        <td>${a.jenis?.toUpperCase()}</td>
        <td>${formatDate(a.expired_at)}</td>
        <td><span class="status ${isExpired ? 'status-expired' : 'status-active'}">${isExpired ? 'Expired' : 'Aktif'}</span></td>
      </tr>
    `;
  }).join('');
}

// --- AKUN ---
async function loadAkun() {
  try {
    const data = await api('/user/accounts');
    const el = document.getElementById('akunTable');
    if (!el) return;
    if (!data.accounts?.length) {
      el.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:28px">Belum ada akun VPN aktif</td></tr>';
      return;
    }
    el.innerHTML = data.accounts.map(a => {
      const exp = new Date(a.expired_at);
      const isExpired = exp < new Date();
      const sisa = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
      return `
        <tr>
          <td><b>${a.username}</b></td>
          <td><span class="badge" style="background:var(--bg3);color:var(--text)">${a.jenis?.toUpperCase()}</span></td>
          <td>${a.server_domain || '-'}</td>
          <td>${formatDate(a.expired_at)}${!isExpired ? ` <span class="text-muted fs-12">(${sisa}h lagi)</span>` : ''}</td>
          <td><span class="status ${isExpired ? 'status-expired' : 'status-active'}">${isExpired ? 'Expired' : 'Aktif'}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="lihatDetailAkun(${JSON.stringify(a).replace(/"/g,'&quot;')})">Detail</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Gagal memuat akun: ' + err.message, 'error');
  }
}

function lihatDetailAkun(akun) {
  const modal = document.getElementById('modalDetail');
  if (!modal) return;
  document.getElementById('modalDetailBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="flex-between"><span class="text-muted">Username</span><span>${akun.username}</span></div>
      <div class="flex-between"><span class="text-muted">Jenis</span><span>${akun.jenis?.toUpperCase()}</span></div>
      <div class="flex-between"><span class="text-muted">Server</span><span>${akun.server_domain || '-'}</span></div>
      <div class="flex-between"><span class="text-muted">Expired</span><span>${formatDate(akun.expired_at)}</span></div>
      ${akun.config_link ? `<div class="mt-8"><a class="btn btn-sm btn-secondary" href="${akun.config_link}" target="_blank">📥 Download Config</a></div>` : ''}
    </div>
  `;
  modal.classList.add('open');
}

// --- DEPOSIT ---
let depositTimer = null;

async function loadDeposit() {
  const form = document.getElementById('depositForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('depositAmount').value);
    const method = document.getElementById('depositMethod').value;
    if (!amount || amount < 10000) return showAlert('depositAlert', 'Minimal deposit Rp 10.000');

    const btn = document.getElementById('depositBtn');
    btn.dataset.label = btn.innerHTML;
    setLoading('depositBtn', true);

    try {
      const data = await api('/deposit/request', {
        method: 'POST',
        body: { amount, method },
      });
      showDepositInfo(data);
    } catch (err) {
      showAlert('depositAlert', err.message);
    } finally {
      setLoading('depositBtn', false);
    }
  });
}

function showDepositInfo(data) {
  const box = document.getElementById('depositResult');
  if (!box) return;
  box.classList.remove('hidden');

  let content = '';
  if (data.qr_code) {
    content += `<div class="text-center mb-16"><img src="${data.qr_code}" style="max-width:220px;border-radius:10px"></div>`;
  }
  if (data.va_number) {
    content += `
      <div class="flex-between mb-8">
        <span class="text-muted">Bank</span>
        <span>${data.bank || '-'}</span>
      </div>
      <div class="flex-between mb-8">
        <span class="text-muted">No. VA</span>
        <span>${data.va_number} <button class="copy-btn" onclick="copyText('${data.va_number}')">Salin</button></span>
      </div>
    `;
  }
  content += `
    <div class="flex-between mb-8">
      <span class="text-muted">Jumlah Transfer</span>
      <b class="text-accent">${formatRupiah(data.amount || 0)}</b>
    </div>
    <div class="flex-between">
      <span class="text-muted">Kadaluarsa</span>
      <span id="expTimer" class="text-yellow">${data.expired_at ? formatDate(data.expired_at) : '15 menit'}</span>
    </div>
  `;
  document.getElementById('depositResultBody').innerHTML = content;

  // Auto-check status
  if (data.order_id) startDepositCheck(data.order_id);
}

function startDepositCheck(orderId) {
  if (depositTimer) clearInterval(depositTimer);
  depositTimer = setInterval(async () => {
    try {
      const res = await api(`/deposit/status/${orderId}`);
      if (res.status === 'paid' || res.status === 'success') {
        clearInterval(depositTimer);
        showToast('✅ Deposit berhasil! Saldo sudah ditambahkan.');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {}
  }, 8000);
}

// --- PRODUK / BELI ---
const KATEGORI = [
  { id: 'ssh', label: '🖥️ SSH', desc: 'SSH Websocket & OpenVPN' },
  { id: 'vmess', label: '⚡ VMess', desc: 'VMess WS, TLS, gRPC' },
  { id: 'vless', label: '🔒 VLess', desc: 'VLess WS, TLS, gRPC' },
  { id: 'trojan', label: '🛡️ Trojan', desc: 'Trojan WS, TLS, gRPC' },
  { id: 'shadowsocks', label: '🌑 Shadowsocks', desc: 'Shadowsocks WS, gRPC' },
  { id: 'zivpn', label: '📡 ZiVPN', desc: 'UDP-based VPN' },
];

async function loadProduk() {
  const grid = document.getElementById('kategoriGrid');
  if (!grid) return;

  grid.innerHTML = KATEGORI.map(k => `
    <div class="product-card" onclick="pilihKategori('${k.id}', '${k.label}')">
      <div class="icon">${k.label.split(' ')[0]}</div>
      <h3>${k.label.split(' ').slice(1).join(' ')}</h3>
      <p>${k.desc}</p>
    </div>
  `).join('');
}

async function pilihKategori(jenis, label) {
  document.getElementById('kategoriGrid').classList.add('hidden');
  const listEl = document.getElementById('paketList');
  listEl.classList.remove('hidden');
  document.getElementById('paketTitle').textContent = label;
  listEl.querySelector('#paketGrid').innerHTML = '<div class="text-muted text-center" style="padding:20px">Memuat paket...</div>';

  document.getElementById('backKategori').onclick = () => {
    listEl.classList.add('hidden');
    document.getElementById('kategoriGrid').classList.remove('hidden');
  };

  try {
    const data = await api(`/products?type=${jenis}`);
    const grid = listEl.querySelector('#paketGrid');
    if (!data.products?.length) {
      grid.innerHTML = '<div class="text-muted text-center" style="padding:20px">Tidak ada paket tersedia</div>';
      return;
    }
    grid.innerHTML = data.products.map(p => `
      <div class="price-card ${p.featured ? 'featured' : ''}">
        ${p.featured ? '<span class="badge-featured">Populer</span>' : ''}
        <h3>${p.name}</h3>
        <div class="price">${formatRupiah(p.price)} <span>/ paket</span></div>
        <ul>
          <li>Durasi: ${p.days} Hari</li>
          <li>Quota: ${p.quota || 'Unlimited'}</li>
          <li>IP Limit: ${p.iplimit || 'Unlimited'}</li>
          <li>${p.server_count || 'Banyak'} Server</li>
        </ul>
        <button class="btn btn-primary btn-block" onclick="openBeliModal('${jenis}',${JSON.stringify(p).replace(/"/g,'&quot;')})">Beli Sekarang</button>
      </div>
    `).join('');
  } catch (err) {
    showToast('Gagal memuat produk: ' + err.message, 'error');
  }
}

async function openBeliModal(jenis, paket) {
  const modal = document.getElementById('modalBeli');
  if (!modal) return;

  document.getElementById('beliPaketName').textContent = paket.name;
  document.getElementById('beliPaketHarga').textContent = formatRupiah(paket.price);

  // Load server list
  try {
    const data = await api(`/servers?type=${jenis}`);
    const sel = document.getElementById('beliServer');
    sel.innerHTML = data.servers?.map(s => `<option value="${s.id}">${s.nama_server} (${s.lokasi})</option>`).join('') || '<option>Tidak ada server</option>';
  } catch {}

  modal.classList.add('open');

  document.getElementById('beliForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('beliUsername').value.trim();
    const server_id = document.getElementById('beliServer').value;

    if (!username) return showAlert('beliAlert', 'Username wajib diisi');
    if (!/^[a-zA-Z0-9]+$/.test(username)) return showAlert('beliAlert', 'Username hanya boleh huruf dan angka');

    const btn = document.getElementById('beliBtn');
    btn.dataset.label = btn.innerHTML;
    setLoading('beliBtn', true);

    try {
      const res = await api('/order/create', {
        method: 'POST',
        body: { jenis, paket_id: paket.id, username, server_id, price: paket.price },
      });
      modal.classList.remove('open');
      showOrderResult(res);
    } catch (err) {
      showAlert('beliAlert', err.message);
    } finally {
      setLoading('beliBtn', false);
    }
  };
}

function showOrderResult(data) {
  const modal = document.getElementById('modalOrderResult');
  if (!modal) return;
  document.getElementById('orderResultBody').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:48px">🎉</div>
      <h3 style="margin-top:8px">Pembelian Berhasil!</h3>
      <p class="text-muted fs-14">Akun VPN kamu sudah siap digunakan</p>
    </div>
    <div style="background:var(--bg3);border-radius:10px;padding:16px;font-family:monospace;font-size:13px;white-space:pre-wrap">${data.account_info || 'Cek panel akun untuk detail'}</div>
    ${data.email_sent ? '<p class="text-muted fs-12 text-center mt-8">📧 Detail akun sudah dikirim ke email kamu</p>' : ''}
    <button class="btn btn-primary btn-block mt-16" onclick="this.closest('.modal-overlay').classList.remove('open');window.location.reload()">Tutup & Refresh</button>
  `;
  modal.classList.add('open');
}

// --- TRANSAKSI ---
async function loadTransaksi() {
  try {
    const data = await api('/user/transactions');
    const el = document.getElementById('trxTable');
    if (!el) return;
    if (!data.transactions?.length) {
      el.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:28px">Belum ada transaksi</td></tr>';
      return;
    }
    el.innerHTML = data.transactions.map(t => `
      <tr>
        <td>${formatDate(t.created_at)}</td>
        <td>${t.type === 'topup' ? '💰 Deposit' : t.type === 'purchase' ? '🛒 Pembelian' : t.type}</td>
        <td>${t.reference_id || '-'}</td>
        <td class="${t.amount > 0 ? 'text-green' : 'text-red'}" style="font-weight:600">${t.amount > 0 ? '+' : ''}${formatRupiah(Math.abs(t.amount))}</td>
        <td><span class="status status-active">✓ Sukses</span></td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Gagal memuat transaksi: ' + err.message, 'error');
  }
}

// --- PROFIL ---
async function loadProfil() {
  try {
    const data = await api('/user/profile');
    const fields = ['profil_username', 'profil_email', 'profil_whatsapp', 'profil_role'];
    if (document.getElementById('profil_username')) document.getElementById('profil_username').value = data.username || '';
    if (document.getElementById('profil_email')) document.getElementById('profil_email').value = data.email || '';
    if (document.getElementById('profil_whatsapp')) document.getElementById('profil_whatsapp').value = data.whatsapp || '';
    if (document.getElementById('profil_role')) document.getElementById('profil_role').textContent = data.role === 'reseller' ? '⭐ Reseller' : '👤 Member';
    if (document.getElementById('profil_saldo')) document.getElementById('profil_saldo').textContent = formatRupiah(data.saldo || 0);
  } catch (err) {
    showToast('Gagal memuat profil: ' + err.message, 'error');
  }

  const form = document.getElementById('ubahPasswordForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const old_password = document.getElementById('old_password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm = document.getElementById('confirm_new_password').value;
    if (new_password !== confirm) return showAlert('profilAlert', 'Password baru tidak cocok');
    if (new_password.length < 6) return showAlert('profilAlert', 'Password minimal 6 karakter');
    try {
      await api('/user/change-password', { method: 'POST', body: { old_password, new_password } });
      showAlert('profilAlert', 'Password berhasil diubah!', 'success');
      form.reset();
    } catch (err) {
      showAlert('profilAlert', err.message);
    }
  });
}

// --- PPOB ---
async function loadPPOB() {
  const form = document.getElementById('ppobForm');
  if (!form) return;

  // Muat kategori PPOB
  try {
    const data = await api('/ppob/categories');
    const sel = document.getElementById('ppobKategori');
    if (sel && data.categories) {
      sel.innerHTML = '<option value="">-- Pilih Kategori --</option>' + 
        data.categories.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
      sel.addEventListener('change', () => loadPPOBProduk(sel.value));
    }
  } catch {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sku = document.getElementById('ppobSku').value;
    const target = document.getElementById('ppobTarget').value.trim();
    if (!sku) return showAlert('ppobAlert', 'Pilih produk terlebih dahulu');
    if (!target) return showAlert('ppobAlert', 'Nomor/ID tujuan wajib diisi');

    const btn = document.getElementById('ppobBtn');
    btn.dataset.label = btn.innerHTML;
    setLoading('ppobBtn', true);
    try {
      const res = await api('/ppob/buy', { method: 'POST', body: { sku, target } });
      showToast('✅ Transaksi PPOB berhasil! SN: ' + (res.sn || '-'));
      form.reset();
    } catch (err) {
      showAlert('ppobAlert', err.message);
    } finally {
      setLoading('ppobBtn', false);
    }
  });
}

async function loadPPOBProduk(kategori) {
  if (!kategori) return;
  const sel = document.getElementById('ppobSku');
  const info = document.getElementById('ppobPriceInfo');
  if (!sel) return;
  sel.innerHTML = '<option>Memuat...</option>';
  try {
    const data = await api(`/ppob/products?category=${kategori}`);
    sel.innerHTML = '<option value="">-- Pilih Produk --</option>' +
      data.products.map(p => `<option value="${p.buyer_sku_code}" data-price="${p.price}">${p.product_name} - ${formatRupiah(p.price)}</option>`).join('');
    sel.onchange = () => {
      const opt = sel.selectedOptions[0];
      if (opt?.dataset.price && info) info.textContent = 'Harga: ' + formatRupiah(opt.dataset.price);
    };
  } catch {}
}

// ===== TABS =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      btn.closest('[data-tabs]').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tab)?.classList.add('active');
    });
  });
}

// ===== MODAL CLOSE =====
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();

  const page = document.body.dataset.page;
  if (page === 'login') initLogin();
  else if (page === 'register') initRegister();
  else if (['dashboard','akun','deposit','beli','transaksi','profil','ppob'].includes(page)) initPanel();
});
