import DatabaseAdapter from './database-adapter.js';

export default class MySQLAdapter extends DatabaseAdapter {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findUserByEmail(email) {
    if (!email) throw new Error('Email is required');
    
    try {
      const [rows] = await this.pool.query(
        `SELECT 
          id,
          email,
          name,
          surname,
          password_hash as passwordHash,
          is_verified as isVerified,
          created_at as createdAt,
          updated_at as updatedAt
        FROM users WHERE email = ?`, 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async createUser(userData) {
    const { name, surname, ...rest } = userData;
    
    try {
      const [result] = await this.pool.query(
        'INSERT INTO users SET ?',
        {
          name: name || null,
          surname: surname || null,
          ...rest,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
      
      return {
        id: result.insertId,
        name,
        surname,
        ...rest
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id, updates) {
    if (!id) throw new Error('User ID is required');
    
    try {
      const { name, surname, ...rest } = updates;
      
      await this.pool.query(
        'UPDATE users SET ? WHERE id = ?',
        [{
          ...rest,
          name: name ?? undefined, // Preserve existing if null
          surname: surname ?? undefined,
          updated_at: new Date()
        }, id]
      );
      
      return this.findUserById(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async findUserById(id) {
    try {
      const [rows] = await this.pool.query(
        `SELECT 
          id,
          email,
          name,
          surname,
          is_verified as isVerified,
          created_at as createdAt
        FROM users WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      await this.pool.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}