import { historyRepository } from '../repositories/history.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  QuizAttempt,
  CreateQuizAttemptDTO,
  UserStats
} from '../types/index.js';

export class HistoryService {
  public saveAttempt(dto: CreateQuizAttemptDTO): QuizAttempt {
    // Verify user exists, fallback to first user if not found
    let user = userRepository.getById(dto.user_id);
    if (!user) {
      const allUsers = userRepository.getAll();
      if (allUsers.length > 0) {
        dto.user_id = allUsers[0].id;
      } else {
        throw new Error('Không tìm thấy người dùng hợp lệ để lưu kết quả');
      }
    }

    if (dto.total_questions <= 0) {
      throw new Error('Số lượng câu hỏi phải lớn hơn 0');
    }

    // Ensure score percentage is calculated accurately
    if (dto.score_percentage === undefined || isNaN(dto.score_percentage)) {
      dto.score_percentage = Math.round((dto.correct_count / dto.total_questions) * 100 * 10) / 10;
    }

    return historyRepository.saveAttempt(dto);
  }

  public getAttempts(
    userId?: number,
    mode?: string,
    limit: number = 50,
    offset: number = 0
  ): QuizAttempt[] {
    return historyRepository.getAttempts(userId, mode, limit, offset);
  }

  public getAttemptById(id: number): QuizAttempt | null {
    return historyRepository.getAttemptById(id);
  }

  public getUserStats(userId: number): UserStats {
    const user = userRepository.getById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return historyRepository.getUserStats(userId);
  }

  public deleteAttempt(id: number): boolean {
    return historyRepository.deleteAttempt(id);
  }

  public clearUserHistory(userId: number): boolean {
    return historyRepository.clearUserHistory(userId);
  }
}

export const historyService = new HistoryService();
