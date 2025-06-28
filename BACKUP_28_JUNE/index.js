import { createServer } from './lib/http/server.js';

const PORT = process.env.APP_PORT || 3000;
createServer(PORT);
