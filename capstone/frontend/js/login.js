/**
 * Ontime LMS - Login Page Interactions
 * Handles: form submission, password toggle, role selection
 */

// ---- DOM Elements ----
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const btnText = loginButton?.querySelector('.btn-text');
const btnLoader = document.getElementById('btnLoader');
const errorMessage = document.getElementById('errorMessage');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');
const emailInput = document.getElementById('email');

// ---- Password Visibility Toggle ----
if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

        // Switch eye icon
        if (isPassword) {
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
            `;
        }
    });
}

// ---- Input Focus Enhancement ----
[emailInput, passwordInput].forEach((input) => {
    if (!input) return;

    input.addEventListener('focus', () => {
        input.classList.add('input-active');
    });

    input.addEventListener('blur', () => {
        if (!input.value) {
            input.classList.remove('input-active');
        }
    });
});

// ---- Helper: Show Error ----
function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// ---- Helper: Hide Error ----
function hideError() {
    if (!errorMessage) return;
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
}

// ---- Helper: Set Loading State ----
function setLoading(isLoading) {
    if (!loginButton || !btnText || !btnLoader) return;

    loginButton.disabled = isLoading;

    if (isLoading) {
        btnText.textContent = 'Signing in...';
        btnLoader.classList.remove('hidden');
    } else {
        btnText.textContent = 'Login';
        btnLoader.classList.add('hidden');
    }
}

// ---- Form Submit Handler ----
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError();

        const email = emailInput?.value?.trim();
        const password = passwordInput?.value;

        // Client-side validation
        if (!email) {
            showError('Email tidak boleh kosong.');
            emailInput?.focus();
            return;
        }

        if (!password) {
            showError('Password tidak boleh kosong.');
            passwordInput?.focus();
            return;
        }

        // Set loading state
        setLoading(true);

        try {
            // Supabase authentication
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                showError('Email atau password salah.');
                setLoading(false);
                return;
            }

            // Successful login - redirect to dashboard
            if (data.session) {
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error('Login error:', err);
            showError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    });
}