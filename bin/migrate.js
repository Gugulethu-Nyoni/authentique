#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import config from '../config/authentique.config.js';
import { getDatabaseAdapter } from '../src/adapters/databases/database-adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  success: chalk.greenBright,
  info: chalk.cyanBright,
  error: chalk.redBright,
  highlight: chalk.magentaBright
};

async function runMigrations() {
  let db;
  try {
    console.log(colors.info(`🏁 Starting ${colors.highlight(config.database.adapter)} migrations`));

    // Initialize only the configured adapter
    db = getDatabaseAdapter(config.database.adapter, config.database.config);
    await db.connect();

    const migrationsDir = path.join(
      __dirname,
      '..',
      'src',
      'adapters',
      'databases',
      config.database.adapter,
      'migrations'
    );

    const files = (await fs.readdir(migrationsDir))
      .filter(f => f.endsWith('.js'))
      .sort();

    if (files.length === 0) {
      console.log(colors.info('ℹ️ No migrations found'));
      return;
    }

    // MySQL-specific table creation
    if (config.database.adapter === 'mysql') {
      await db.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Run migrations
    let count = 0;
    for (const file of files) {
      try {
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(migrationPath);
        
        await db.beginTransaction();
        await migration.up(db);
        
        if (config.database.adapter === 'mysql') {
          await db.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
        }
        
        await db.commit();
        count++;

        // MySQL-specific table listing
        if (config.database.adapter === 'mysql') {
          const tables = await db.query('SHOW TABLES');
          console.log(colors.success('✅ Tables:'));
          tables.forEach(t => {
            const tableKey = `Tables_in_${config.database.config.database}`;
            console.log(`   - ${colors.highlight(t[tableKey])}`);
          });
        }
      } catch (err) {
        await db.rollback();
        console.log(colors.error(`❌ Migration failed: ${err.message}`));
        throw err;
      }
    }

    console.log(
      count > 0 
        ? colors.success(`\n✨ ${colors.highlight(count)} migration(s) applied`)
        : colors.info('✅ Database is up-to-date')
    );
  } catch (err) {
    console.log(colors.error(`💥 Migration error: ${err.message}`));
    process.exit(1);
  } finally {
    if (db) await db.disconnect();
  }
}

runMigrations();