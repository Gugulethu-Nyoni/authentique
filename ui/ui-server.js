// ui-server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createGuard } from './server/middleware/authGuard.js';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const uiRoot = path.join(__dirname, '../ui');
console.log('📦 Serving UI files from:', uiRoot);

// Debug logger middleware
app.use((req, res, next) => {
  console.log('\n=== New Request ===');
  console.log('Path:', req.path);
  console.log('Cookies:', req.cookies);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

/**
 * Helper: Proxy a request to the backend API
 */
const proxyRequest = async (req, res, options) => {
  try {
    const { url, method = 'GET', headers = {}, body } = options;
    const backendResponse = await fetch(url, {
      method,
      headers,
      body
    });

    // Forward Set-Cookie header if present
    const setCookieHeader = backendResponse.headers.get('Set-Cookie');
    if (setCookieHeader) {
      console.log('➡️ Forwarding Set-Cookie header from backend.');
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    const text = await backendResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error(`❌ Non-JSON response from backend at ${url}:`, text);
      return res.status(502).json({ success: false, message: 'Invalid backend response' });
    }

    res.status(backendResponse.status).json(data);
  } catch (err) {
    console.error('💥 Proxy error:', err);
    res.status(502).json({ success: false, message: 'Bad gateway' });
  }
};

// Token verification proxy
app.get('/api/verify-token', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    console.log('❌ No token provided for verification');
    return res.status(401).json({ success: false, message: 'No authentication token provided' });
  }

  console.log('🔒 Proxying token verification to auth server...');
  await proxyRequest(req, res, {
    url: 'http://localhost:3000/api/verify-token',
    headers: {
      'Cookie': `auth_token=${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// Public API proxies (login, signup, logout)
app.post(['/api/login', '/api/signup', '/api/logout'], async (req, res) => {
  console.log(`🔀 Proxying public API request to backend: ${req.originalUrl}`);
  await proxyRequest(req, res, {
    url: `http://localhost:3000${req.originalUrl}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // This header might not always be needed for logout
    body: JSON.stringify(req.body) // For logout, req.body might be empty, but stringify still works
  });
});

// Validate session proxy
app.get('/api/validate-session', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No session token' });
  }

  console.log('🔒 Proxying session validation to auth server...');
  await proxyRequest(req, res, {
    url: 'http://localhost:3000/api/validate-session',
    headers: {
      'Cookie': `auth_token=${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// Protected API proxy routes (with guard)
app.use('/api', createGuard(), async (req, res) => {
  console.log(`🔀 Proxying protected API request: ${req.originalUrl}`);
  await proxyRequest(req, res, {
    url: `http://localhost:3000${req.originalUrl}`,
    method: req.method,
    headers: {
      ...req.headers,
      'Cookie': req.cookies.auth_token ? `auth_token=${req.cookies.auth_token}` : undefined,
      'Content-Type': req.headers['content-type'] || 'application/json'
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
  });
});

// Static asset routes
app.use('/assets', express.static(path.join(uiRoot, 'assets')));
app.use('/auth', express.static(path.join(uiRoot, 'auth')));
app.use('/dashboard', createGuard(), express.static(path.join(uiRoot, 'dashboard')));


// ⭐ NEW: Route to serve reset-password.html
// This MUST come BEFORE the general 404 fallback
app.get('/reset-password', (req, res) => {
    console.log('Serving reset-password.html');
    res.sendFile(path.join(uiRoot, 'auth/reset-password.html')); // Assuming it's in ui/auth/
});

// ⭐ Also ensure your confirm-email route is handled, if applicable
app.get('/confirm-email', (req, res) => {
    console.log('Serving confirm-email.html');
    res.sendFile(path.join(uiRoot, 'auth/confirm-email.html')); // Assuming it's in ui/auth/
});


// Auth 404 fallback
app.use('/auth', (req, res) => {
  console.log('❌ Auth route not found - 404');
  res.status(404).sendFile(path.join(uiRoot, 'auth/404.html'));
});

// General 404 fallback
app.use((req, res) => {
  console.log('➡️ Route not found - redirecting to login');
  res.redirect('/auth/login.html');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).sendFile(path.join(uiRoot, 'auth/500.html'));
});

// Start server
app.listen(3001, () => {
  console.log('✅ UI Server running at http://localhost:3001');
  console.log('🔐 Auth API proxy configured for http://localhost:3000');
});
