import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class MigrationRunner {
  constructor(pool) {
    this.pool = pool;
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  async #ensureMigrationsTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  }

  async #getExecutedMigrations() {
    const [rows] = await this.pool.query('SELECT name FROM migrations');
    return new Set(rows.map(row => row.name));
  }

  async run() {
    await this.#ensureMigrationsTable();
    const executedMigrations = await this.#getExecutedMigrations();
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        const migration = await import(path.join(this.migrationsPath, file));
        console.log(`Running migration: ${file}`);
        
        await this.pool.query('START TRANSACTION');
        try {
          await migration.up(this.pool);
          await this.pool.query('INSERT INTO migrations (name) VALUES (?)', [file]);
          await this.pool.query('COMMIT');
        } catch (err) {
          await this.pool.query('ROLLBACK');
          throw new Error(`Migration failed: ${file}\n${err.message}`);
        }
      }
    }
  }
}