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

    // Initialize Default User if empty
    try {
      const userCount = dbInstance.prepare('SELECT count(*) as count FROM users').get() as { count: number };
      if (userCount.count === 0) {
        dbInstance.prepare(`
          INSERT INTO users (username, display_name, email, role, color)
          VALUES (?, ?, ?, ?, ?)
        `).run('default_user', 'Kỹ Sư Trẻ', 'engineer@techquiz.io', 'engineer', '#06b6d4');
      }
    } catch (e) {
      console.error('Error seeding default user:', e);
    }
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
