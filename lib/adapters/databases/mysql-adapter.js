import DatabaseAdapter from './database-adapter.js';

export default class MySQLAdapter extends DatabaseAdapter {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findUserByEmail(email) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    return rows[0] || null;
  }

  async createUser(userData) {
    const [result] = await this.pool.query(
      'INSERT INTO users SET ?',
      [userData]
    );
    return { id: result.insertId, ...userData };
  }

  async updateUser(id, updates) {
    await this.pool.query(
      'UPDATE users SET ? WHERE id = ?',
      [updates, id]
    );
    return this.findUserById(id);
  }
}