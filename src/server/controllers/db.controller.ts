import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { seedTechnicalData } from '../db/seed.js';

export class DbController {
  public async getDbSchema(_req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const tablesStmt = db.prepare(`
        SELECT name, sql FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name ASC
      `);
      const tables = tablesStmt.all() as Array<{ name: string; sql: string }>;

      const indexesStmt = db.prepare(`
        SELECT name, tbl_name, sql FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
        ORDER BY tbl_name ASC
      `);
      const indexes = indexesStmt.all();

      const counts: Record<string, number> = {};
      for (const t of tables) {
        const countStmt = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`);
        const result = countStmt.get() as { count: number };
        counts[t.name] = result.count;
      }

      // DB file size info
      const dbPath = path.resolve(process.cwd(), 'data/app.db');
      let fileSize = 0;
      if (fs.existsSync(dbPath)) {
        fileSize = fs.statSync(dbPath).size;
      }

      // Pragmas
      const journalMode = db.pragma('journal_mode', { simple: true });
      const foreignKeys = db.pragma('foreign_keys', { simple: true });

      res.json({
        success: true,
        data: {
          tables,
          indexes,
          counts,
          stats: {
            filePath: dbPath,
            fileSize,
            journalMode,
            foreignKeys
          }
        }
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getTableData(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const tableName = String(req.params.tableName);
      const allowedTables = ['topics', 'questions', 'options', 'media_assets'];

      if (!allowedTables.includes(tableName)) {
        res.status(400).json({ success: false, message: `Invalid table: ${tableName}` });
        return;
      }

      const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
      const rows = db.prepare(`SELECT * FROM "${tableName}" ORDER BY rowid DESC LIMIT 100`).all();

      res.json({
        success: true,
        data: {
          tableName,
          columns,
          rows
        }
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async seedDatabase(_req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const result = await seedTechnicalData();
      res.json({
        success: true,
        message: 'Database seeded with technical questions and diagrams successfully',
        data: result
      });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const dbController = new DbController();
