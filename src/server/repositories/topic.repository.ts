import { db } from '../db/database.js';
import { Topic } from '../types/index.js';

export class TopicRepository {
  getAll(): Topic[] {
    const stmt = db.prepare('SELECT * FROM topics ORDER BY level ASC, name ASC');
    return stmt.all() as Topic[];
  }

  getByLevel(level: number): Topic[] {
    const stmt = db.prepare('SELECT * FROM topics WHERE level = ? ORDER BY name ASC');
    return stmt.all(level) as Topic[];
  }

  getById(id: number): Topic | null {
    const stmt = db.prepare('SELECT * FROM topics WHERE id = ?');
    const result = stmt.get(id);
    return (result as Topic) || null;
  }

  create(topic: Omit<Topic, 'id'>): number {
    const stmt = db.prepare(`
      INSERT INTO topics (name, parent_id, level, path)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(topic.name, topic.parent_id, topic.level, topic.path);
    return Number(result.lastInsertRowid);
  }

  count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM topics');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export const topicRepository = new TopicRepository();
