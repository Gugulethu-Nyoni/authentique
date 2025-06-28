document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const statusDiv = document.getElementById('auth-status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'error' : 'success';
    statusDiv.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showStatus('Please enter both email and password.', true);
      return;
    }

    showStatus('Logging in...');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // important for cookie to be sent back
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      showStatus('Login successful! Redirecting...');

      // Redirect after short delay to dashboard or homepage
      setTimeout(() => {
        window.location.href = '/dashboard/index.html'; // or your protected page
      }, 1000);

    } catch (err) {
      showStatus(err.message, true);
    }
  });
});
