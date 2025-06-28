import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createGuard } from './server/middleware/authGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());

const uiRoot = path.join(__dirname, '../ui');


// Serve static assets
app.use('/assets', express.static(path.join(uiRoot, '../assets')));

// Utility to serve directory with optional guard
function serveDirectory(dirPath, urlPrefix, protect = false, allowedRoles = []) {
  const fullPath = path.join(uiRoot, dirPath);
  if (fs.existsSync(fullPath)) {
    if (protect) {
      app.use(urlPrefix, createGuard(allowedRoles), express.static(fullPath));
    } else {
      app.use(urlPrefix, express.static(fullPath));
    }
  }
}

// Load modular route files
import authRoutes from './server/routes/auth.routes.js';
import dashboardRoutes from './server/routes/dashboard.routes.js';
import adminRoutes from './server/routes/admin.routes.js';

authRoutes(app, serveDirectory);
dashboardRoutes(app, serveDirectory);
adminRoutes(app, serveDirectory);  // example

// Fallback redirect
// 404 for /auth if no file found
app.use('/auth', (req, res) => {
  res.status(404).send('Auth page not found');
});

// fallback redirect for all other unmatched routes
app.use((req, res) => {
  res.redirect('/auth/login.html');
});


app.listen(3001, () => {
  console.log('UI Server running at http://localhost:3001');
});
