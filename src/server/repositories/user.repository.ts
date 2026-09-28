import { db } from '../db/database.js';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/index.js';

export class UserRepository {
  public getAll(): User[] {
    const stmt = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = u.id) as total_attempts,
        (SELECT ROUND(AVG(score_percentage), 1) FROM quiz_attempts qa WHERE qa.user_id = u.id) as avg_score
      FROM users u
      ORDER BY u.last_active_at DESC
    `);
    return stmt.all() as User[];
  }

  public getById(id: number): User | null {
    const stmt = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = u.id) as total_attempts,
        (SELECT ROUND(AVG(score_percentage), 1) FROM quiz_attempts qa WHERE qa.user_id = u.id) as avg_score
      FROM users u
      WHERE u.id = ?
    `);
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  public getByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    return user || null;
  }

  public create(dto: CreateUserDTO): User {
    const stmt = db.prepare(`
      INSERT INTO users (username, display_name, email, avatar_url, role, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      dto.username,
      dto.display_name,
      dto.email || null,
      dto.avatar_url || null,
      dto.role || 'student',
      dto.color || '#06b6d4'
    );
    const created = this.getById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to retrieve created user');
    }
    return created;
  }

  public update(id: number, dto: UpdateUserDTO): User | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (dto.display_name !== undefined) {
      fields.push('display_name = ?');
      values.push(dto.display_name);
    }
    if (dto.email !== undefined) {
      fields.push('email = ?');
      values.push(dto.email);
    }
    if (dto.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(dto.avatar_url);
    }
    if (dto.role !== undefined) {
      fields.push('role = ?');
      values.push(dto.role);
    }
    if (dto.color !== undefined) {
      fields.push('color = ?');
      values.push(dto.color);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, last_active_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(...values);

    return this.getById(id);
  }

  public delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  public touchLastActive(id: number): void {
    const stmt = db.prepare('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }

  public count(): number {
    const stmt = db.prepare('SELECT count(*) as count FROM users');
    const res = stmt.get() as { count: number };
    return res.count;
  }
}

export const userRepository = new UserRepository();
