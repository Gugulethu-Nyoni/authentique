// src/adapters/databases/database-adapter.js
import MySQLAdapter from './mysql/adapter.js';
import SQLiteAdapter from './sqlite/adapter.js';
import MongoDBAdapter from './mongodb/adapter.js';
import SupabaseAdapter from './supabase/adapter.js';




// src/adapters/databases/database-adapter.js
export function getDatabaseAdapter(adapterName, config) {
  try {
    // Only load the adapter we need
    const adapterPath = `./${adapterName.toLowerCase()}/adapter.js`;
    const { default: Adapter } = await import(adapterPath);
    return new Adapter(config);
  } catch (err) {
    throw new Error(`Failed to load ${adapterName} adapter: ${err.message}`);
  }
}



export class DatabaseAdapter {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    throw new Error('Not implemented');
  }

  async disconnect() {
    throw new Error('Not implemented');
  }

  async query(sql, params) {
    throw new Error('Not implemented');
  }

  async beginTransaction() {
    throw new Error('Not implemented');
  }

  async commit() {
    throw new Error('Not implemented');
  }

  async rollback() {
    throw new Error('Not implemented');
  }
}