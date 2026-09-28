import { userRepository } from '../repositories/user.repository.js';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/index.js';

const AVATAR_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6'  // Teal
];

export class UserService {
  public getAllUsers(): User[] {
    return userRepository.getAll();
  }

  public getUserById(id: number): User | null {
    return userRepository.getById(id);
  }

  public createUser(dto: CreateUserDTO): User {
    // Validate username
    const cleanUsername = dto.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanUsername || cleanUsername.length < 2) {
      throw new Error('Tên người dùng phải có ít nhất 2 ký tự (chữ cái, số hoặc dấu gạch dưới)');
    }

    const existing = userRepository.getByUsername(cleanUsername);
    if (existing) {
      throw new Error(`Tên người dùng "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác`);
    }

    const displayName = dto.display_name?.trim() || cleanUsername;
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    return userRepository.create({
      username: cleanUsername,
      display_name: displayName,
      email: dto.email?.trim() || null,
      avatar_url: dto.avatar_url || null,
      role: dto.role || 'student',
      color: dto.color || randomColor
    });
  }

  public updateUser(id: number, dto: UpdateUserDTO): User | null {
    const existing = userRepository.getById(id);
    if (!existing) {
      throw new Error('Không tìm thấy người dùng');
    }

    return userRepository.update(id, {
      display_name: dto.display_name?.trim(),
      email: dto.email?.trim(),
      avatar_url: dto.avatar_url,
      role: dto.role,
      color: dto.color
    });
  }

  public deleteUser(id: number): boolean {
    const totalUsers = userRepository.count();
    if (totalUsers <= 1) {
      throw new Error('Không thể xóa người dùng duy nhất trong hệ thống');
    }
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
