#!/usr/bin/env node
import { chmodSync } from 'fs';

try {
  chmodSync('./bin/init.js', 0o755);
  chmodSync('./bin/migrate.js', 0o755);
} catch (err) {
  console.error('Failed to set permissions:', err.message);
  process.exit(1);
}