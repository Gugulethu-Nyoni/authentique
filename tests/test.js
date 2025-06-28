import dotenv from 'dotenv';
import path from 'path';

// Use __dirname to get script folder, then go up one level (to project root)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

console.log('Loading env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env loaded successfully');
}

console.log('Environment variables loaded:');
console.log('DB_MYSQL_HOST:', process.env.DB_MYSQL_HOST);
console.log('DB_MYSQL_PORT:', process.env.DB_MYSQL_PORT);
console.log('DB_MYSQL_USER:', process.env.DB_MYSQL_USER);
console.log('DB_MYSQL_PASSWORD:', process.env.DB_MYSQL_PASSWORD ? '***' : undefined);
console.log('DB_MYSQL_NAME:', process.env.DB_MYSQL_NAME);
console.log('DB_MYSQL_POOL_LIMIT:', process.env.DB_MYSQL_POOL_LIMIT);
