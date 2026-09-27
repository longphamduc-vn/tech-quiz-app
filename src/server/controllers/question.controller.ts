import { Request, Response, NextFunction } from 'express';
import { questionService } from '../services/question.service.js';
import { CreateQuestionDTO } from '../types/index.js';

export class QuestionController {
  public async getQuestions(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const topicId = req.query.topic_id ? parseInt(req.query.topic_id as string, 10) : undefined;
      const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string, 10) : undefined;
      const random = req.query.random === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const questions = questionService.getQuestions(topicId, difficulty, random, limit);
      res.json({
        success: true,
        data: questions
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getQuestionById(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid question id' });
        return;
      }

      const question = questionService.getQuestionById(id);
      if (!question) {
        res.status(404).json({ success: false, message: 'Question not found' });
        return;
      }

      res.json({
        success: true,
        data: question
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async createQuestion(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { topic_id, difficulty_level, question_type, tags, context_text, content, explanation, options } = req.body;

      if (!topic_id) {
        res.status(400).json({ success: false, message: 'topic_id is required' });
        return;
      }
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'content is required' });
        return;
      }
      if (!options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({ success: false, message: 'At least 2 options are required' });
        return;
      }

      const dto: CreateQuestionDTO = {
        topic_id: Number(topic_id),
        difficulty_level: difficulty_level ? Number(difficulty_level) : 2,
        question_type: question_type || 'SINGLE_CHOICE',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
        context_text: context_text || null,
        content: content.trim(),
        explanation: explanation || null,
        options: options.map((opt: any, idx: number) => ({
          content: opt.content,
          is_correct: Boolean(opt.is_correct),
          has_image: Boolean(opt.has_image),
          image_url: opt.image_url || null,
          order_index: opt.order_index ?? (idx + 1)
        }))
      };

      const createdQuestion = questionService.createQuestion(dto);
      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: createdQuestion
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async deleteQuestion(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid question id' });
        return;
      }

      const success = questionService.deleteQuestion(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Question not found or already deleted' });
        return;
      }

      res.json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const questionController = new QuestionController();
