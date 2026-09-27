import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DB_DIR, 'app.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? undefined : undefined
    });

    // Optimize SQLite for high performance and integrity
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('synchronous = NORMAL');

    // Initialize Schema
    dbInstance.exec(SCHEMA_SQL);
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export const db = getDb();
