import { db } from '../db/database.js';
import { MediaAsset } from '../types/index.js';

export class MediaRepository {
  getByKey(key: string): MediaAsset | null {
    const stmt = db.prepare('SELECT * FROM media_assets WHERE media_key = ?');
    const result = stmt.get(key);
    return (result as MediaAsset) || null;
  }

  getByKeys(keys: string[]): MediaAsset[] {
    if (!keys || keys.length === 0) return [];
    const placeholders = keys.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM media_assets WHERE media_key IN (${placeholders})`);
    return stmt.all(...keys) as MediaAsset[];
  }

  getAll(): MediaAsset[] {
    const stmt = db.prepare('SELECT * FROM media_assets ORDER BY media_key ASC');
    return stmt.all() as MediaAsset[];
  }

  create(media: MediaAsset): void {
    const stmt = db.prepare(`
      INSERT INTO media_assets (media_key, url, alt_text, caption)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(media_key) DO UPDATE SET
        url = excluded.url,
        alt_text = excluded.alt_text,
        caption = excluded.caption
    `);
    stmt.run(media.media_key, media.url, media.alt_text ?? null, media.caption ?? null);
  }

  delete(key: string): boolean {
    const stmt = db.prepare('DELETE FROM media_assets WHERE media_key = ?');
    const result = stmt.run(key);
    return result.changes > 0;
  }

  count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM media_assets');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export const mediaRepository = new MediaRepository();
