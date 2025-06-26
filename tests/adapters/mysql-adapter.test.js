import mysql from 'mysql2/promise';
import MySQLAdapter from '../../lib/adapters/databases/mysql-adapter.js';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';

describe('MySQLAdapter', () => {
  let pool, adapter, testUserId;

  before(async () => {
    // 1. Create test database connection
    pool = mysql.createPool({
      host: process.env.DB_MYSQL_HOST || 'localhost',
      user: process.env.DB_MYSQL_USER || 'root',
      password: process.env.DB_MYSQL_PASSWORD || '',
      database: 'test_auth',
      connectionLimit: 1 // Isolate tests
    });

    adapter = new MySQLAdapter(pool);

    // 2. Initialize test tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE
      )
    `);
  });

  after(async () => {
    // Cleanup
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.end();
  });

  describe('createUser()', () => {
    it('should insert new users', async () => {
      const userId = await adapter.createUser({
        email: 'test@example.com',
        passwordHash: 'hashed_pass_123'
      });

      testUserId = userId; // Store for later tests
      expect(userId).to.be.a('number');
    });

    it('should reject duplicate emails', async () => {
      try {
        await adapter.createUser({
          email: 'test@example.com', // Duplicate
          passwordHash: 'another_pass'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.message).to.include('ER_DUP_ENTRY');
      }
    });
  });

  describe('findUserByEmail()', () => {
    it('should retrieve existing users', async () => {
      const user = await adapter.findUserByEmail('test@example.com');
      expect(user).to.include({
        email: 'test@example.com',
        is_verified: false
      });
    });

    it('should return null for non-existent users', async () => {
      const user = await adapter.findUserByEmail('nonexistent@test.com');
      expect(user).to.be.null;
    });
  });

  describe('updateUser()', () => {
    it('should modify user data', async () => {
      await adapter.updateUser(testUserId, {
        is_verified: true
      });

      const user = await pool.query(
        'SELECT is_verified FROM users WHERE id = ?',
        [testUserId]
      );
      expect(user[0][0].is_verified).to.equal(1);
    });
  });

  describe('transaction support', () => {
    it('should rollback on failure', async () => {
      try {
        await pool.query('START TRANSACTION');
        await adapter.createUser({
          email: 'tx-test@example.com',
          passwordHash: 'tx_pass'
        });
        throw new Error('Simulated failure');
      } catch {
        await pool.query('ROLLBACK');
      }

      const user = await adapter.findUserByEmail('tx-test@example.com');
      expect(user).to.be.null;
    });
  });
});