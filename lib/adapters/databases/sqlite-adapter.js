import DatabaseAdapter from './database-adapter.js';

export default class SQLiteAdapter extends DatabaseAdapter {
  constructor(db) {
    super();
    this.db = db;
  }

  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }

  async createUser(userData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (email, passwordHash, isVerified) VALUES (?, ?, ?)',
        [userData.email, userData.passwordHash, userData.isVerified || false],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, ...userData });
        }
      );
    });
  }
}