// src/adapters/databases/supabase/index.js
import SupabaseAdapter from './adapter.js';
import config from '../../../../config/databases.js';

let instance;

export function getSupabaseAdapter() {
  if (!instance) {
    instance = new SupabaseAdapter({
      url: config.supabase.url,
      key: config.supabase.anonKey,
    });
  }
  return instance;
}
