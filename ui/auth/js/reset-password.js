import AppConfig from './config.js';


// ui/auth/js/reset-password.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Reset Password script initialized');

    // Constants
    const PATHS = {
        RESET_PASSWORD_API: `${AppConfig.BASE_URL}/api/reset-password`, // Backend API endpoint
        LOGIN_PAGE: '/auth/login.html' // Your login page
    };

    // DOM Elements
    const form = document.getElementById('reset-password-form');
    const newPasswordField = document.getElementById('new-password');
    const confirmPasswordField = document.getElementById('confirm-password');
    const statusDiv = document.getElementById('auth-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    let resetToken = null; // To store the token from the URL

    // UI Utilities
    function showStatus(message, isError = false) {
        console.log(`UI Status: ${message}`);
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error' : 'success'; // Assuming .error and .success classes
        statusDiv.classList.remove('hidden');
    }

    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Resetting...' : 'Reset Password';
        form.classList.toggle('loading', isLoading); // For visual loading state
    }

    // Function to extract token from URL
    function extractTokenFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (!token) {
            showStatus('Password reset link is invalid or expired. Please request a new one.', true);
            console.error('❌ Token not found in URL.');
            // Optionally disable the form or redirect if no token
            setLoadingState(true); // Disable form
        } else {
            resetToken = token;
            console.log('✅ Token extracted from URL.');
        }
    }

    // Form Submission Handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Reset Password form submission started');
        setLoadingState(true);
        statusDiv.classList.add('hidden'); // Hide previous status message

        if (!resetToken) {
            showStatus('Missing reset token. Please use the link from your email.', true);
            setLoadingState(false);
            return;
        }

        const newPassword = newPasswordField.value;
        const confirmPassword = confirmPasswordField.value;

        // Input Validation
        if (!newPassword || !confirmPassword) {
            showStatus('Please fill in both password fields.', true);
            setLoadingState(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            showStatus('Passwords do not match.', true);
            setLoadingState(false);
            return;
        }

        // Basic password strength validation (adjust as needed)
        if (newPassword.length < 8) {
            showStatus('Password must be at least 8 characters long.', true);
            setLoadingState(false);
            return;
        }

        showStatus('Attempting to reset password...');
        console.log('🔐 Sending password reset request...');

        try {
            const response = await fetch(PATHS.RESET_PASSWORD_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: resetToken, newPassword: newPassword })
            });

            const data = await response.json();
            console.log('Backend response:', data);

            if (response.ok) {
                showStatus(data.message || 'Your password has been successfully reset. Redirecting to login...', false);
                // Clear fields
                newPasswordField.value = '';
                confirmPasswordField.value = '';
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.replace(PATHS.LOGIN_PAGE);
                }, 2000);
            } else {
                // Display error message from backend
                showStatus(data.message || 'Failed to reset password. Please try again.', true);
            }

        } catch (err) {
            console.error('❌ Password reset request error:', err);
            showStatus('An unexpected error occurred. Please try again later.', true);
        } finally {
            setLoadingState(false);
        }
    });

    // On page load:
    extractTokenFromUrl(); // Get token from URL
    newPasswordField.focus(); // Auto-focus the first password field
    console.log('📄 Reset Password form ready');
});