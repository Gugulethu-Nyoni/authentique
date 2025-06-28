// src/adapters/databases/supabase/adapter.js
import { createClient } from '@supabase/supabase-js';
import { DatabaseAdapter } from '../database-adapter.js';

export default class SupabaseAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.client = createClient(config.url, config.key);
  }

  async connect() {
    return this.client;
  }

  async disconnect() {
    // Supabase doesn't require explicit disconnection
    return Promise.resolve();
  }

  async query(table, operation, ...args) {
    return this.client.from(table)[operation](...args);
  }

  // Supabase handles transactions differently
  async beginTransaction() {
    this.transaction = this.client.rpc('begin');
    return this.transaction;
  }

  async commit() {
    return this.client.rpc('commit');
  }

  async rollback() {
    return this.client.rpc('rollback');
  }
}