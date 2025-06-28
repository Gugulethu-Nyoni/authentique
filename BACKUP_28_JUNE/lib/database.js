import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection pool with your env vars
const pool = mysql.createPool({
  host: process.env.DB_MYSQL_HOST || 'localhost',
  port: process.env.DB_MYSQL_PORT || 3306,
  user: process.env.DB_MYSQL_USER || 'root',
  password: process.env.DB_MYSQL_PASSWORD || 'my-secret-pw',
  database: process.env.DB_MYSQL_NAME || 'test_auth',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_MYSQL_POOL_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Export query interface
export const db = {
  query: (sql, params) => pool.query(sql, params)
};