const message = document.getElementById('message');

async function handleCredentialResponse(response) {

try {

if (message) {
    message.innerText = 'Memproses login Google...';
}

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

    // simpan user
    localStorage.setItem(
        'user',
        JSON.stringify(result.user)
    );

    // simpan token google
    localStorage.setItem(
        'token',
        response.credential
    );

    if (message) {
        message.innerText = 'Login berhasil';
    }

    setTimeout(() => {

        window.location.href =
            'dashboard.html';

    }, 1000);

} else {

    if (message) {
        message.innerText =
            result.message ||
            'Login Google gagal';
    }

}

} catch (err) {

console.error(err);

if (message) {
    message.innerText =
        'Server tidak dapat dihubungi';
}

}

}

// ==================== DASHBOARD ====================

const usernameEl =
document.getElementById('username');

const emailEl =
document.getElementById('email');

const roleEl =
document.getElementById('role');

if (usernameEl) {

const user =
JSON.parse(
localStorage.getItem('user')
);

if (!user) {

window.location.href =
    'index.html';

} else {

usernameEl.innerText =
    user.username || '-';

emailEl.innerText =
    user.email || '-';

roleEl.innerText =
    user.role || 'user';

}

}

function logout() {

localStorage.removeItem('user');

localStorage.removeItem('token');

window.location.href =
'index.html';

}
