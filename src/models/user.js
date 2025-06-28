import { getMySQLAdapter } from '../adapters/databases/mysql/index.js';

const db = getMySQLAdapter();

export const findUserByEmail = async (email) => {
  const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async (user) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, verification_token, verification_token_expires_at) 
     VALUES (?, ?, ?, ?, ?)`,
    [user.name, user.email, user.password_hash, user.verification_token, user.verification_token_expires_at]
  );
  return result.insertId;
};
