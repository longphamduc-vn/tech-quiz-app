import { db } from '../db/database.js';
import { questionRepository } from '../repositories/question.repository.js';
import { mediaRepository } from '../repositories/media.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import {
  CreateQuestionDTO,
  QuestionWithOptionsAndMedia,
  QuestionRow,
  MediaAsset
} from '../types/index.js';

export const MEDIA_TAG_REGEX = /<!--\s*media:([\w-]+)\s*-->/g;

export class QuestionService {
  /**
   * Scans text and extracts all matching media keys using the specified regex
   */
  public extractMediaKeys(text: string | null | undefined): string[] {
    if (!text) return [];
    const keys: string[] = [];
    const regex = new RegExp(MEDIA_TAG_REGEX.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match[1] && !keys.includes(match[1])) {
        keys.push(match[1]);
      }
    }
    return keys;
  }

  /**
   * Creates a new question and its options atomically in an SQLite transaction.
   * Auto-triggers the Media Regex Parser service to populate has_context_image, has_media, and media_keys.
   */
  public createQuestion(dto: CreateQuestionDTO): QuestionWithOptionsAndMedia {
    // 1. Scan both context_text and content
    const contextKeys = this.extractMediaKeys(dto.context_text);
    const contentKeys = this.extractMediaKeys(dto.content);

    // 2. Extract all unique matching media keys
    const allMediaKeys = Array.from(new Set([...contextKeys, ...contentKeys]));

    // 3. Automatically set flags
    const has_context_image = contextKeys.length > 0 ? 1 : 0;
    const has_media = contentKeys.length > 0 ? 1 : 0;

    // 4. Atomic transaction block
    const createTransaction = db.transaction(() => {
      const questionId = questionRepository.createQuestion({
        topic_id: dto.topic_id,
        difficulty_level: dto.difficulty_level ?? 2,
        question_type: dto.question_type ?? 'SINGLE_CHOICE',
        tags: dto.tags ? JSON.stringify(dto.tags) : JSON.stringify([]),
        context_text: dto.context_text ?? null,
        has_context_image,
        content: dto.content,
        has_media,
        media_keys: JSON.stringify(allMediaKeys),
        explanation: dto.explanation ?? null
      });

      if (dto.options && dto.options.length > 0) {
        questionRepository.createOptions(questionId, dto.options);
      }

      return questionId;
    });

    const newQuestionId = createTransaction();
    const created = this.getQuestionById(newQuestionId);
    if (!created) {
      throw new Error(`Failed to retrieve question #${newQuestionId} after creation`);
    }

    return created;
  }

  /**
   * Retrieves question details with parsed tags, media_keys, options, and media_map
   */
  public getQuestionById(id: number): QuestionWithOptionsAndMedia | null {
    const row = questionRepository.getById(id);
    if (!row) return null;
    return this.hydrateQuestion(row);
  }

  /**
   * Fetches questions filtered by topic_id and/or difficulty with options and media_map
   */
  public getQuestions(topic_id?: number, difficulty?: number, random?: boolean, limit?: number): QuestionWithOptionsAndMedia[] {
    const rows = questionRepository.getFiltered(topic_id, difficulty, random, limit);
    return rows.map((row) => this.hydrateQuestion(row));
  }

  /**
   * Deletes a question and cascades to options
   */
  public deleteQuestion(id: number): boolean {
    return questionRepository.delete(id);
  }

  /**
   * Hydrates a raw database QuestionRow:
   * 1. Parses media_keys JSON array
   * 2. Queries media_assets for all keys
   * 3. Constructs media_map dictionary: { [key]: { url, alt_text, caption } }
   * 4. Loads options and topic hierarchy metadata
   */
  private hydrateQuestion(row: QuestionRow): QuestionWithOptionsAndMedia {
    let parsedMediaKeys: string[] = [];
    try {
      if (row.media_keys) {
        parsedMediaKeys = JSON.parse(row.media_keys);
      }
    } catch {
      parsedMediaKeys = [];
    }

    let parsedTags: string[] = [];
    try {
      if (row.tags) {
        parsedTags = JSON.parse(row.tags);
      }
    } catch {
      parsedTags = [];
    }

    // Query media_assets for all keys present in media_keys
    const mediaAssets = mediaRepository.getByKeys(parsedMediaKeys);
    const media_map: Record<string, MediaAsset> = {};
    for (const asset of mediaAssets) {
      media_map[asset.media_key] = asset;
    }

    const options = questionRepository.getOptionsByQuestionId(row.id);
    const topic = topicRepository.getById(row.topic_id) || undefined;

    return {
      id: row.id,
      topic_id: row.topic_id,
      difficulty_level: row.difficulty_level,
      question_type: row.question_type,
      tags: parsedTags,
      context_text: row.context_text,
      has_context_image: row.has_context_image,
      content: row.content,
      has_media: row.has_media,
      media_keys: parsedMediaKeys,
      explanation: row.explanation,
      created_at: row.created_at,
      options,
      media_map,
      topic
    };
  }
}

export const questionService = new QuestionService();
