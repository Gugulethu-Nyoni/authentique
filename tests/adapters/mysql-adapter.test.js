import mysql from 'mysql2/promise';
import MySQLAdapter from '../../lib/adapters/databases/mysql-adapter.js';

describe('MySQLAdapter', () => {
  let pool, adapter;

  beforeAll(async () => {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: 'test',
      password: 'test',
      database: 'test_db',
      waitForConnections: true,
      connectionLimit: 10
    });
    adapter = new MySQLAdapter(pool);
    
    // Setup test table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        passwordHash VARCHAR(255),
        isVerified BOOLEAN DEFAULT false
      )
    `);
  });

  afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.end();
  });

  it('should create and find users', async () => {
    const user = await adapter.createUser({
      email: 'test@mysql.com',
      passwordHash: 'hashed_pass'
    });
    
    const found = await adapter.findUserByEmail('test@mysql.com');
    expect(found.email).toBe(user.email);
  });
});