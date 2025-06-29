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

console.log('📦 Serving UI files from project root:', __dirname);

// ✅ Static asset routes (place these early!)
app.use('/auth', express.static(path.join(__dirname, 'auth')));
app.use('/dashboard', createGuard(), express.static(path.join(__dirname, 'dashboard')));

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

// Helper: Proxy a request to the backend API
const proxyRequest = async (req, res, options) => {
  try {
    const { url, method = 'GET', headers = {}, body } = options;
    const backendResponse = await fetch(url, { method, headers, body });

    const setCookieHeader = backendResponse.headers.get('Set-Cookie');
    if (setCookieHeader) {
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

// Public API proxies
app.post(['/api/login', '/api/signup', '/api/logout'], async (req, res) => {
  await proxyRequest(req, res, {
    url: `http://localhost:3000${req.originalUrl}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
});

// Token verification
app.get('/api/verify-token', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No authentication token provided' });
  }

  await proxyRequest(req, res, {
    url: 'http://localhost:3000/api/verify-token',
    headers: {
      'Cookie': `auth_token=${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// Validate session
app.get('/api/validate-session', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No session token' });
  }

  await proxyRequest(req, res, {
    url: 'http://localhost:3000/api/validate-session',
    headers: {
      'Cookie': `auth_token=${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// Protected API proxy routes
app.use('/api', createGuard(), async (req, res) => {
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

// General 404 fallback
app.use((req, res) => {
  console.log('➡️ Route not found - redirecting to login');
  res.redirect('/auth/login.html');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(3001, () => {
  console.log('✅ UI Server running at http://localhost:3001');
  console.log('🔐 Auth API proxy configured for http://localhost:3000');
});
