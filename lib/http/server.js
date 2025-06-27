import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAuthRoutes } from './routes/auth.js';
import { authenticateRequest } from '../middleware/authenticate.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register API routes
const baseRoutes = {};
const routes = registerAuthRoutes(baseRoutes);

// Helper: serve static files
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// Helper: serve HTML views from /ui/components
function serveHtmlView(res, viewName) {
  const viewPath = path.join(__dirname, '../../ui/components', `${viewName}.html`);
  serveStaticFile(res, viewPath, 'text/html');
}

// Frontend route map
// Update your frontendRoutes array to include dashboard and account:
const frontendRoutes = [
  { match: (url) => url === '/' || url === '/signup', view: 'signup' },
  { match: (url) => url.startsWith('/auth/confirm'), view: 'email-confirmation' },
  { match: (url) => url === '/login', view: 'login' },
  { match: (url) => url === '/forgot-password', view: 'forgot-password' },
  { match: (url) => url === '/reset-password', view: 'reset-password' },
  { match: (url) => url === '/verify-email', view: 'verify-email' },
  // Add these new routes:
  { match: (url) => url === '/dashboard', view: 'dashboard' },
  { match: (url) => url === '/account', view: 'account' }
];

// Add authentication middleware
/*
async function authenticateRequest(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw { status: 401, message: 'Unauthorized' };
  }

  try {
    // Verify token (you'll need to import your jwt utility)
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (err) {
    throw { status: 403, message: 'Invalid token' };
  }
}
*/


// Then modify your server creation to handle protected routes:
export function createServer(port = 3000) {
  const server = http.createServer(async (req, res) => {
    try {
      const routeKey = `${req.method} ${req.url}`;

      // Handle CORS preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
      }

      // Handle frontend HTML routes
      if (req.method === 'GET') {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        // Check if route is protected
        const isProtectedRoute = ['/dashboard', '/account'].includes(pathname);
        
        if (isProtectedRoute) {
          try {
            await authenticateRequest(req);
          } catch (authError) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
          }
        }

        const matchedRoute = frontendRoutes.find(route => route.match(pathname));
        if (matchedRoute) {
          return serveHtmlView(res, matchedRoute.view);
        }

        // Serve static assets
        if (req.url.startsWith('/css/')) {
          const filePath = path.join(__dirname, '../../ui', req.url);
          return serveStaticFile(res, filePath, 'text/css');
        }

        if (req.url.startsWith('/js/')) {
          const filePath = path.join(__dirname, '../../ui', req.url);
          return serveStaticFile(res, filePath, 'application/javascript');
        }
      }

      // Handle API routes
      const handler = routes[routeKey];
      if (!handler) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
      }

      // Parse JSON body
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          
          // Add authentication for protected API routes
          if (routeKey.startsWith('POST /api/')) {
            const user = await authenticateRequest(req);
            data.user = user; // Add user to handler context
          }
          
        const response = await handler({ body: data });

// Build headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

// Include Set-Cookie if the handler returns it
if (response.headers?.['Set-Cookie']) {
  headers['Set-Cookie'] = response.headers['Set-Cookie'];
}

// Instead of sending a 302 redirect, send 200 OK with redirect info in JSON
if (response.redirect) {
  // Don't set 'Location' header or 302 status here
  res.writeHead(response.status || 200, headers);
  res.end(JSON.stringify({
    message: response.message,
    redirect: response.redirect,
    data: response.data
  }));
} else {
  res.writeHead(response.status || 200, headers);
  res.end(JSON.stringify({
    message: response.message,
    data: response.data
  }));
}





        } catch (err) {
          res.writeHead(err.status || 500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });

  server.listen(port, () => {
    console.log(`🔐 Authentique server running at http://localhost:${port}`);
  });

  return server;
}