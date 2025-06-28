#!/usr/bin/env node

// Ensure environment is loaded first
import '../config/env-loader.js';

import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fs from 'fs/promises';
import databaseConfig from '../config/databases.js';
import config from '../config/authentique.config.js';
import { getDatabaseAdapter } from '../src/adapters/databases/database-adapter.js';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  success: chalk.greenBright,
  info: chalk.cyanBright,
  error: chalk.redBright,
  highlight: chalk.magentaBright
};

// Test direct connection
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
  }
}

// Load config dynamically
const mysqlConfig = databaseConfig.mysql;

console.log(colors.info('MySQL config loaded at runtime:'), mysqlConfig);

await testConnection(mysqlConfig);

// Run migrations
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

    const pool = db.pool; // ✅ correct — use the pool property

    // Path to migrations folder
    const migrationsDir = path.join(__dirname, '..', 'src', 'adapters', 'databases', 'mysql', 'migrations');

    // Read and filter migration files
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => /^\d+.*\.js$/.test(f)).sort();

    if (migrationFiles.length === 0) {
      console.log(colors.info('ℹ️ No migration files found.'));
      return;
    }

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      console.log(colors.info(`➡️ Running migration: ${file}`));

      // Dynamically import migration file
      const migration = await import(migrationPath);

      if (typeof migration.up !== 'function') {
        console.warn(colors.error(`⚠️ Migration file ${file} does not export an 'up' function. Skipping.`));
        continue;
      }

      await migration.up(pool);
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

await runMigrations();
