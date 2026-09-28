import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';

export class UserController {
  public async getUsers(_req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const users = userService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getUserById(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        return;
      }

      const user = userService.getUserById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async createUser(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { username, display_name, email, avatar_url, role, color } = req.body;

      if (!username || !username.trim()) {
        res.status(400).json({ success: false, message: 'Tên người dùng là bắt buộc' });
        return;
      }

      const created = userService.createUser({
        username,
        display_name: display_name || username,
        email,
        avatar_url,
        role,
        color
      });

      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản người dùng thành công',
        data: created
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async updateUser(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        return;
      }

      const { display_name, email, avatar_url, role, color } = req.body;
      const updated = userService.updateUser(id, {
        display_name,
        email,
        avatar_url,
        role,
        color
      });

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: updated
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async deleteUser(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        return;
      }

      const success = userService.deleteUser(id);
      res.json({
        success,
        message: 'Đã xóa người dùng thành công'
      });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const userController = new UserController();
