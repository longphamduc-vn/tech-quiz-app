import { db } from '../db/database.js';
import {
  QuizAttempt,
  QuizAttemptRow,
  CreateQuizAttemptDTO,
  UserStats,
  User
} from '../types/index.js';

export class HistoryRepository {
  public saveAttempt(dto: CreateQuizAttemptDTO): QuizAttempt {
    const stmt = db.prepare(`
      INSERT INTO quiz_attempts (
        user_id, topic_id, topic_name, mode, view_mode,
        total_questions, answered_count, correct_count,
        score_percentage, time_spent_seconds, answers_detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      dto.user_id,
      dto.topic_id || null,
      dto.topic_name || null,
      dto.mode,
      dto.view_mode || 'list',
      dto.total_questions,
      dto.answered_count,
      dto.correct_count,
      dto.score_percentage,
      dto.time_spent_seconds,
      JSON.stringify(dto.answers_detail)
    );

    // Update user last_active_at
    db.prepare('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?').run(dto.user_id);

    const saved = this.getAttemptById(Number(result.lastInsertRowid));
    if (!saved) {
      throw new Error('Failed to retrieve saved quiz attempt');
    }
    return saved;
  }

  public getAttempts(
    userId?: number,
    mode?: string,
    limit: number = 50,
    offset: number = 0
  ): QuizAttempt[] {
    const conditions: string[] = [];
    const params: any[] = [];

    if (userId) {
      conditions.push('qa.user_id = ?');
      params.push(userId);
    }
    if (mode && ['exam', 'practice'].includes(mode)) {
      conditions.push('qa.mode = ?');
      params.push(mode);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT 
        qa.*,
        u.username, u.display_name, u.avatar_url, u.role, u.color
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      ${whereClause}
      ORDER BY qa.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(sql).all(...params) as Array<QuizAttemptRow & {
      username: string;
      display_name: string;
      avatar_url: string | null;
      role: 'student' | 'engineer' | 'admin';
      color: string;
    }>;

    return rows.map((r) => this.mapRowToAttempt(r));
  }

  public getAttemptById(id: number): QuizAttempt | null {
    const stmt = db.prepare(`
      SELECT 
        qa.*,
        u.username, u.display_name, u.avatar_url, u.role, u.color
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.id = ?
    `);

    const row = stmt.get(id) as (QuizAttemptRow & {
      username: string;
      display_name: string;
      avatar_url: string | null;
      role: 'student' | 'engineer' | 'admin';
      color: string;
    }) | undefined;

    if (!row) return null;
    return this.mapRowToAttempt(row);
  }

  public deleteAttempt(id: number): boolean {
    const stmt = db.prepare('DELETE FROM quiz_attempts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  public clearUserHistory(userId: number): boolean {
    const stmt = db.prepare('DELETE FROM quiz_attempts WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes > 0;
  }

  public getUserStats(userId: number): UserStats {
    const totalStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN mode = 'exam' THEN 1 ELSE 0 END) as exam_attempts,
        SUM(CASE WHEN mode = 'practice' THEN 1 ELSE 0 END) as practice_attempts,
        ROUND(AVG(score_percentage), 1) as avg_score,
        MAX(score_percentage) as highest_score,
        SUM(time_spent_seconds) as total_time_spent_seconds,
        SUM(answered_count) as total_questions_answered,
        SUM(correct_count) as total_correct_answers
      FROM quiz_attempts
      WHERE user_id = ?
    `);

    const statsRow = totalStmt.get(userId) as any;

    const totalAttempts = statsRow?.total_attempts || 0;
    const totalAnswered = statsRow?.total_questions_answered || 0;
    const totalCorrect = statsRow?.total_correct_answers || 0;
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const recentStmt = db.prepare(`
      SELECT id, mode, score_percentage, created_at, topic_name, total_questions, correct_count
      FROM quiz_attempts
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `);
    const recent = recentStmt.all(userId) as any[];

    return {
      user_id: userId,
      total_attempts: totalAttempts,
      exam_attempts: statsRow?.exam_attempts || 0,
      practice_attempts: statsRow?.practice_attempts || 0,
      avg_score: statsRow?.avg_score || 0,
      highest_score: statsRow?.highest_score || 0,
      total_time_spent_seconds: statsRow?.total_time_spent_seconds || 0,
      total_questions_answered: totalAnswered,
      total_correct_answers: totalCorrect,
      overall_accuracy: overallAccuracy,
      recent_attempts: recent
    };
  }

  private mapRowToAttempt(row: any): QuizAttempt {
    let answersDetail = [];
    try {
      answersDetail = JSON.parse(row.answers_detail);
    } catch (e) {
      answersDetail = [];
    }

    const user: User = {
      id: row.user_id,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      role: row.role,
      color: row.color,
      created_at: '',
      last_active_at: ''
    };

    return {
      id: row.id,
      user_id: row.user_id,
      topic_id: row.topic_id,
      topic_name: row.topic_name,
      mode: row.mode,
      view_mode: row.view_mode,
      total_questions: row.total_questions,
      answered_count: row.answered_count,
      correct_count: row.correct_count,
      score_percentage: row.score_percentage,
      time_spent_seconds: row.time_spent_seconds,
      created_at: row.created_at,
      answers_detail: answersDetail,
      user
    };
  }
}

export const historyRepository = new HistoryRepository();
