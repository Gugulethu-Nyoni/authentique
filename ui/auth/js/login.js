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
      const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
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
  console.error('Login error:', err);
  // If err.message exists, use it, else convert err to string
  showStatus(err.message || JSON.stringify(err), true);
}
  });
});
