import { Request, Response, NextFunction } from 'express';
import { historyService } from '../services/history.service.js';

export class HistoryController {
  public async createAttempt(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const {
        user_id,
        topic_id,
        topic_name,
        mode,
        view_mode,
        total_questions,
        answered_count,
        correct_count,
        score_percentage,
        time_spent_seconds,
        answers_detail
      } = req.body;

      if (!user_id) {
        res.status(400).json({ success: false, message: 'user_id là bắt buộc' });
        return;
      }
      if (!total_questions || total_questions <= 0) {
        res.status(400).json({ success: false, message: 'total_questions phải lớn hơn 0' });
        return;
      }
      if (!Array.isArray(answers_detail)) {
        res.status(400).json({ success: false, message: 'answers_detail phải là danh sách chi tiết câu hỏi' });
        return;
      }

      const saved = historyService.saveAttempt({
        user_id: Number(user_id),
        topic_id: topic_id ? Number(topic_id) : null,
        topic_name: topic_name || null,
        mode: mode === 'practice' ? 'practice' : 'exam',
        view_mode: view_mode === 'single' ? 'single' : 'list',
        total_questions: Number(total_questions),
        answered_count: Number(answered_count || 0),
        correct_count: Number(correct_count || 0),
        score_percentage: Number(score_percentage ?? ((Number(correct_count || 0) / Number(total_questions)) * 100)),
        time_spent_seconds: Number(time_spent_seconds || 0),
        answers_detail
      });

      res.status(201).json({
        success: true,
        message: 'Lưu lịch sử bài làm thành công',
        data: saved
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getAttempts(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined;
      const mode = req.query.mode as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const attempts = historyService.getAttempts(userId, mode, limit, offset);
      res.json({
        success: true,
        data: attempts
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getAttemptById(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID lượt làm bài không hợp lệ' });
        return;
      }

      const attempt = historyService.getAttemptById(id);
      if (!attempt) {
        res.status(404).json({ success: false, message: 'Không tìm thấy thông tin lượt làm bài' });
        return;
      }

      res.json({
        success: true,
        data: attempt
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getUserStats(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        return;
      }

      const stats = historyService.getUserStats(userId);
      res.json({
        success: true,
        data: stats
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async deleteAttempt(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        return;
      }

      const success = historyService.deleteAttempt(id);
      res.json({
        success,
        message: success ? 'Đã xóa lượt làm bài' : 'Không tìm thấy lượt làm bài cần xóa'
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async clearUserHistory(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        return;
      }

      const success = historyService.clearUserHistory(userId);
      res.json({
        success: true,
        message: 'Đã xóa toàn bộ lịch sử làm bài của người dùng'
      });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const historyController = new HistoryController();
