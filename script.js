// ==================== LOGIN ====================

const loginForm = document.getElementById('loginForm');

if (loginForm) {

    loginForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const email =
            document.getElementById('email').value;

        const password =
            document.getElementById('password').value;

        const message =
            document.getElementById('message');

        try {

            message.innerText = 'Memproses login...';

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const result = await response.json();

            message.innerText =
                result.message || 'Login berhasil';

        } catch (err) {

            message.innerText =
                'Server tidak dapat dihubungi';

        }

    });

}

// ==================== REGISTER ====================

const registerForm = document.getElementById('registerForm');

if (registerForm) {

    registerForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const username =
            document.getElementById('username').value;

        const email =
            document.getElementById('email').value;

        const password =
            document.getElementById('password').value;

        const confirmPassword =
            document.getElementById('confirmPassword').value;

        const message =
            document.getElementById('message');

        if (password !== confirmPassword) {

            message.innerText =
                'Password tidak cocok';

            return;
        }

        try {

            message.innerText =
                'Mendaftarkan akun...';

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const result = await response.json();

            message.innerText =
                result.message;

            if (result.success) {

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            }

        } catch (err) {

            message.innerText =
                'Server tidak dapat dihubungi';

        }

    });

}
