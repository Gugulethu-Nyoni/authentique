import '../../config/env-loader.js'; //load .env
import config from '../../config/authentique.config.js';
import { getDatabaseAdapter } from '../adapters/databases/database-adapter.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',  // UI server origin
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use(authRoutes);

app.listen(3000, () => {
  console.log('Auth API server running at http://localhost:3000');
});
