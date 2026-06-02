// =========================
// MEDIA XTRIMER WEB PANEL
// =========================

const API = "/api";

// =========================
// KIRIM OTP
// =========================
async function sendOTP() {

    const email =
        document.getElementById("email").value.trim();

    if (!email) {
        alert("Masukkan email terlebih dahulu");
        return;
    }

    try {

        const req = await fetch(`${API}/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        });

        const res = await req.json();

        alert(res.message);

    } catch (err) {

        alert("Gagal terhubung ke server");

        console.error(err);

    }
}

// =========================
// REGISTER
// =========================
async function registerUser() {

    const email =
        document.getElementById("email").value.trim();

    const otp =
        document.getElementById("otp").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!email || !otp || !password) {
        alert("Lengkapi semua data");
        return;
    }

    if (password !== confirmPassword) {
        alert("Konfirmasi password tidak sama");
        return;
    }

    try {

        const req = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                otp
            })
        });

        const res = await req.json();

        alert(res.message);

        if (res.success) {
            window.location.href = "login.html";
        }

    } catch (err) {

        alert("Gagal terhubung ke server");

        console.error(err);

    }
}
