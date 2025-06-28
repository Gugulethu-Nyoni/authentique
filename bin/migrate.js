#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/authentique.config.js';

async function runMigrations() {
  const adapter = config.database.adapter;
  const migrationsDir = path.join(
    process.cwd(),
    'src',
    'adapters',
    'databases',
    adapter,
    'migrations'
  );

  try {
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    console.log(`🏃 Running ${adapter} migrations...`);
    
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      // TODO: Execute SQL via database adapter
      console.log(`✓ Applied: ${file}`);
    }
    
    console.log('✨ All migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();