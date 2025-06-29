// ui/public/js/forgot-password.js (or ui/src/js/forgot-password.js)
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Forgot Password script initialized');

    // Constants for API path
    const PATHS = {
        FORGOT_PASSWORD_API: 'http://localhost:3000/api/forgot-password', // Assuming backend is on 3000
        LOGIN_PAGE: '/login' // Assuming your login page is at /login
    };

    // DOM Elements
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('reset-email');
    const statusDiv = document.getElementById('auth-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    // UI Utilities
    function showStatus(message, isError = false) {
        console.log(`UI Status: ${message}`);
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error' : 'success'; // Assuming you have .error and .success classes in auth.css
        statusDiv.classList.remove('hidden');
    }

    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Sending...' : 'Send Reset Link';
        // Add a class to the form or button for additional loading visuals if needed
        form.classList.toggle('loading', isLoading);
    }

    // Form Submission Handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Forgot Password form submission started');
        setLoadingState(true);
        statusDiv.classList.add('hidden'); // Hide previous status message

        const email = emailInput.value.trim();

        // Input validation
        if (!email) {
            console.log('❌ Validation failed - email missing');
            showStatus('Please enter your email address.', true);
            setLoadingState(false);
            return;
        }

        // Basic email format validation (can be more robust on backend)
        if (!/\S+@\S+\.\S+/.test(email)) {
            console.log('❌ Validation failed - invalid email format');
            showStatus('Please enter a valid email address.', true);
            setLoadingState(false);
            return;
        }

        showStatus('Sending reset link...');
        console.log('📧 Attempting to send password reset link for:', email);

        try {
            const response = await fetch(PATHS.FORGOT_PASSWORD_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // credentials: 'include' is not strictly necessary for this endpoint unless specific cookie-based CSRF is involved
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log('Backend response:', data);

            if (response.ok) {
                // Backend sends success even if email not found for security reasons
                showStatus(data.message || 'If an account with that email exists, a password reset link has been sent.', false);
                // Optionally clear the email field
                emailInput.value = '';
            } else {
                // Display specific error message from backend or a generic one
                showStatus(data.message || 'Failed to send reset link. Please try again.', true);
            }

        } catch (err) {
            console.error('❌ Forgot password request error:', err);
            showStatus('An unexpected error occurred. Please try again later.', true);
        } finally {
            setLoadingState(false);
        }
    });

    // Auto-focus email field on load
    emailInput.focus();
    console.log('📄 Forgot Password form ready');
});