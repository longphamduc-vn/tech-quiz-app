import { db } from '../db/database.js';
import { QuestionRow, QuestionOption, CreateOptionDTO } from '../types/index.js';

export interface InsertQuestionData {
  topic_id: number;
  difficulty_level: number;
  question_type: string;
  tags: string;
  context_text: string | null;
  has_context_image: number;
  content: string;
  has_media: number;
  media_keys: string;
  explanation: string | null;
}

export class QuestionRepository {
  getFiltered(topic_id?: number, difficulty?: number, random?: boolean, limit?: number): QuestionRow[] {
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params: any[] = [];

    if (topic_id !== undefined && !isNaN(topic_id)) {
      // Find topic's path to support hierarchical subtopic queries
      const topicStmt = db.prepare('SELECT path FROM topics WHERE id = ?');
      const topic = topicStmt.get(topic_id) as { path: string } | undefined;

      if (topic) {
        query += ` AND (topic_id = ? OR topic_id IN (
          SELECT id FROM topics WHERE path LIKE ? OR path = ?
        ))`;
        params.push(topic_id, `${topic.path}/%`, topic.path);
      } else {
        query += ' AND topic_id = ?';
        params.push(topic_id);
      }
    }

    if (difficulty !== undefined && !isNaN(difficulty)) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty);
    }

    if (random) {
      query += ' ORDER BY RANDOM()';
    } else {
      query += ' ORDER BY id ASC';
    }

    if (limit !== undefined && !isNaN(limit) && limit > 0) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const stmt = db.prepare(query);
    return stmt.all(...params) as QuestionRow[];
  }

  getById(id: number): QuestionRow | null {
    const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    const result = stmt.get(id);
    return (result as QuestionRow) || null;
  }

  getOptionsByQuestionId(questionId: number): QuestionOption[] {
    const stmt = db.prepare(`
      SELECT * FROM options 
      WHERE question_id = ? 
      ORDER BY order_index ASC, id ASC
    `);
    return stmt.all(questionId) as QuestionOption[];
  }

  createQuestion(data: InsertQuestionData): number {
    const stmt = db.prepare(`
      INSERT INTO questions (
        topic_id, difficulty_level, question_type, tags,
        context_text, has_context_image, content, has_media,
        media_keys, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.topic_id,
      data.difficulty_level,
      data.question_type,
      data.tags,
      data.context_text,
      data.has_context_image,
      data.content,
      data.has_media,
      data.media_keys,
      data.explanation
    );

    return Number(result.lastInsertRowid);
  }

  createOptions(questionId: number, options: CreateOptionDTO[]): void {
    const stmt = db.prepare(`
      INSERT INTO options (question_id, content, is_correct, has_image, image_url, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      stmt.run(
        questionId,
        opt.content,
        opt.is_correct ? 1 : 0,
        opt.has_image ? 1 : 0,
        opt.image_url ?? null,
        opt.order_index ?? (i + 1)
      );
    }
  }

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM questions');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export const questionRepository = new QuestionRepository();
