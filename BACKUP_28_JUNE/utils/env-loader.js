// env-loader.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verify loading worked
console.log('Environment loaded. DB_MYSQL_HOST:', process.env.DB_MYSQL_HOST);