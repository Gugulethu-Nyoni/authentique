#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import MigrationRunner from '../lib/adapters/databases/mysql-migration-runner.js';

const pool = mysql.createPool({
  host: process.env.DB_MYSQL_HOST || 'localhost',
  user: process.env.DB_MYSQL_USER || 'root',
  password: process.env.DB_MYSQL_PASSWORD || '',
  database: process.env.DB_MYSQL_NAME || 'auth_service',
  connectionLimit: process.env.DB_MYSQL_POOL_LIMIT || 5
});

const runner = new MigrationRunner(pool, { verbose: true });

const command = process.argv[2] || 'run';

try {
  if (command === 'run') {
    await runner.run();
    console.log('Migrations completed successfully');
  } 
  else if (command === 'rollback') {
    const steps = parseInt(process.argv[3]) || 1;
    await runner.rollback(steps);
    console.log(`Rolled back ${steps} migration(s)`);
  }
} catch (err) {
  console.error('Migration error:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
