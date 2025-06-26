// DOM Elements
const forms = {
  signup: document.getElementById('signup-form'),
  login: document.getElementById('login-form'),
  forgotPassword: document.getElementById('forgot-password-form'),
  resetPassword: document.getElementById('reset-password-form')
};

// Form Handlers
const handleAuth = async (form, endpoint) => {
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const res = await fetch(`/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    // Success handling
    if (data.redirect) window.location.href = data.redirect;
  } catch (err) {
    showAlert(form, err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
};

// Alert System
const showAlert = (form, message, type) => {
  const alertEl = document.createElement('div');
  alertEl.className = `text-${type} mb-4`;
  alertEl.textContent = message;
  form.prepend(alertEl);
  setTimeout(() => alertEl.remove(), 5000);
};

// Attach Events
Object.entries(forms).forEach(([key, form]) => {
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAuth(form, key);
  });
});