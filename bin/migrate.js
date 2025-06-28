#!/usr/bin/env node

// Ensure environment is loaded first
import '../config/env-loader.js';

import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fs from 'fs/promises';
import mysql from 'mysql2/promise';

import databaseConfig from '../config/databases.js';
import config from '../config/authentique.config.js';
import { getDatabaseAdapter } from '../src/adapters/databases/database-adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  success: chalk.greenBright,
  info: chalk.cyanBright,
  error: chalk.redBright,
  highlight: chalk.magentaBright
};

// Parse command line args, default to 'run'
const args = process.argv.slice(2);
const command = args[0] || 'run';
const rollbackSteps = args[1] ? Number(args[1]) : 1;

async function testConnection(mysqlConfig) {
  try {
    const connection = await mysql.createConnection({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      port: mysqlConfig.port || 3306,
      ssl: false
    });

    const [rows] = await connection.execute('SELECT 1');
    console.log(colors.success('✅ Direct connection test OK:'), rows);
    await connection.end();
  } catch (error) {
    console.error(colors.error('❌ Direct connection test failed:'), error);
    process.exit(1);
  }
}

const mysqlConfig = databaseConfig.mysql;

console.log(colors.info('MySQL config loaded at runtime:'), mysqlConfig);

await testConnection(mysqlConfig);

async function runMigrations() {
  let db;
  try {
    console.log(colors.info(`🏁 Starting ${colors.highlight(config.database.adapter)} migrations`));

    if (config.database.adapter !== 'mysql') {
      throw new Error(`Only MySQL migrations are currently supported. You requested: ${config.database.adapter}`);
    }

    db = await getDatabaseAdapter(config.database.adapter, mysqlConfig);
    await db.connect();
    console.log(colors.info('DB Adapter instance:'), db);

    const pool = db.pool;

    // Ensure migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDir = path.join(__dirname, '..', 'src', 'adapters', 'databases', 'mysql', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => /^\d+.*\.js$/.test(f)).sort();

    if (migrationFiles.length === 0) {
      console.log(colors.info('ℹ️ No migration files found.'));
      return;
    }

    const [appliedRows] = await pool.query('SELECT name FROM migrations');
    const appliedMigrations = new Set(appliedRows.map(row => row.name));

    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        console.log(colors.info(`⏭️ Skipping already applied migration: ${file}`));
        continue;
      }

      const migrationPath = path.join(migrationsDir, file);
      console.log(colors.info(`➡️ Running migration: ${file}`));

      const migration = await import(migrationPath);

      if (typeof migration.up !== 'function') {
        console.warn(colors.error(`⚠️ Migration file ${file} does not export an 'up' function. Skipping.`));
        continue;
      }

      await migration.up(pool);

      await pool.query('INSERT INTO migrations (name) VALUES (?)', [file]);

      console.log(colors.success(`✅ Migration completed: ${file}`));
    }

    console.log(colors.success('🎉 All migrations executed successfully.'));
  } catch (err) {
    console.log(colors.error(`💥 Migration error: ${err.message}`));
    process.exit(1);
  } finally {
    if (db) await db.disconnect();
  }
}

async function rollbackMigrations(steps) {
  let db;
  try {
    console.log(colors.info(`🏁 Rolling back ${steps} migration(s)`));

    if (config.database.adapter !== 'mysql') {
      throw new Error(`Only MySQL migrations are currently supported. You requested: ${config.database.adapter}`);
    }

    db = await getDatabaseAdapter(config.database.adapter, mysqlConfig);
    await db.connect();
    console.log(colors.info('DB Adapter instance:'), db);

    const pool = db.pool;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [appliedRows] = await pool.query('SELECT name FROM migrations ORDER BY run_on DESC');
    if (appliedRows.length === 0) {
      console.log(colors.info('ℹ️ No migrations have been applied.'));
      return;
    }

    const toRollback = appliedRows.slice(0, steps);

    const migrationsDir = path.join(__dirname, '..', 'src', 'adapters', 'databases', 'mysql', 'migrations');

    for (const row of toRollback) {
      const migrationPath = path.join(migrationsDir, row.name);
      console.log(colors.info(`↩️ Rolling back migration: ${row.name}`));

      const migration = await import(migrationPath);

      if (typeof migration.down !== 'function') {
        console.warn(colors.error(`⚠️ Migration file ${row.name} does not export a 'down' function. Skipping rollback.`));
        continue;
      }

      await migration.down(pool);

      await pool.query('DELETE FROM migrations WHERE name = ?', [row.name]);

      console.log(colors.success(`✅ Rollback completed: ${row.name}`));
    }

    console.log(colors.success(`🎉 Rolled back ${toRollback.length} migration(s) successfully.`));
  } catch (err) {
    console.log(colors.error(`💥 Rollback error: ${err.message}`));
    process.exit(1);
  } finally {
    if (db) await db.disconnect();
  }
}

if (command === 'run') {
  await runMigrations();
} else if (command === 'rollback') {
  await rollbackMigrations(rollbackSteps);
} else {
  console.error(colors.error(`Unknown command: ${command}`));
  console.log(colors.info('Usage: authentique-migrate [run|rollback] [steps]'));
  process.exit(1);
}
