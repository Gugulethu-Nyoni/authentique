import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class MigrationRunner {
  constructor(pool, config = {}) {
    this.pool = pool;
    this.migrationsPath = config.migrationsPath || path.join(__dirname, 'migrations');
    this.verbose = config.verbose ?? true;
  }

  

  async #ensureMigrationsTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  }

  async #getLatestBatch() {
    const [rows] = await this.pool.query(
      'SELECT MAX(batch) as max_batch FROM migrations'
    );
    return rows[0].max_batch || 0;
  }

  async run() {
    await this.#ensureMigrationsTable();
    const batch = (await this.#getLatestBatch()) + 1;
    const migrationFiles = this.#getMigrationFiles();

    for (const file of migrationFiles) {
      if (this.verbose) console.log(`Processing ${file}`);
      
      await this.pool.query('START TRANSACTION');
      try {
        const { up } = await import(path.join(this.migrationsPath, file));
        await up(this.pool);
        await this.pool.query(
          'INSERT INTO migrations (name, batch) VALUES (?, ?)',
          [file, batch]
        );
        await this.pool.query('COMMIT');
      } catch (err) {
        await this.pool.query('ROLLBACK');
        throw new Error(`Migration failed: ${file}\n${err.stack}`);
      }
    }
  }

  #getMigrationFiles() {
    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .filter(file => !file.match(/^\./)); // Ignore hidden files
  }

  async rollback(steps = 1) {
    await this.#ensureMigrationsTable();
    const [migrations] = await this.pool.query(
      'SELECT name FROM migrations ORDER BY batch DESC, name DESC LIMIT ?',
      [steps]
    );

    for (const { name } of migrations) {
      if (this.verbose) console.log(`Rolling back: ${name}`);
      
      await this.pool.query('START TRANSACTION');
      try {
        const { down } = await import(path.join(this.migrationsPath, name));
        await down(this.pool);
        await this.pool.query('DELETE FROM migrations WHERE name = ?', [name]);
        await this.pool.query('COMMIT');
      } catch (err) {
        await this.pool.query('ROLLBACK');
        throw new Error(`Rollback failed: ${name}\n${err.stack}`);
      }
    }
  }
}