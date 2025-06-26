import http from 'http';
import { registerAuthRoutes } from './routes/auth.js';

// Initialize routes with auth routes
const baseRoutes = {};
const routes = registerAuthRoutes(baseRoutes);

export function createServer(port = 3000) {
  const server = http.createServer(async (req, res) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
      }

      const routeKey = `${req.method} ${req.url}`;
      const handler = routes[routeKey];

      if (!handler) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
      }

      let body = '';
      req.on('data', chunk => (body += chunk));
      
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const response = await handler({ body: data });
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          
          res.end(JSON.stringify(response));
        } catch (err) {
          const statusCode = err.status || 500;
          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: err.message || 'Internal Server Error'
          }));
        }
      });

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });

  server.listen(port, () => console.log(`Auth server running on port ${port}`));
  return server;
}