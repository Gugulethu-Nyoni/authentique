import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import SQLiteAdapter from '../../lib/adapters/databases/sqlite-adapter.js';

describe('SQLiteAdapter', () => {
  let db, adapter;

  beforeAll(async () => {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });
    adapter = new SQLiteAdapter(db);
    
    await db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        passwordHash TEXT,
        isVerified BOOLEAN DEFAULT 0
      )
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  it('should handle user operations', async () => {
    const user = await adapter.createUser({
      email: 'test@sqlite.com',
      passwordHash: 'hashed_pass'
    });
    
    expect(user.id).toBeDefined();
    expect(await adapter.findUserByEmail('test@sqlite.com')).toBeTruthy();
  });
});