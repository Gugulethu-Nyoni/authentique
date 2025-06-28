// src/adapters/databases/mysql/adapter.js
import mysql from 'mysql2/promise';
import { DatabaseAdapter } from '../database-adapter.js';

export default class MySQLAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: config.poolLimit || 10,
      queueLimit: 0
    });
  }

  async connect() {
    this.connection = await this.pool.getConnection();
  }

  async disconnect() {
    if (this.connection) this.connection.release();
    await this.pool.end();
  }

  async query(sql, params) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async beginTransaction() {
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
  }

  async commit() {
    await this.connection.commit();
    this.connection.release();
  }

  async rollback() {
    await this.connection.rollback();
    this.connection.release();
  }
}