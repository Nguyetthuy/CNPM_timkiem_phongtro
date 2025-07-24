// ===============================
// user-service/src/controllers/user.controller.ts
// ===============================
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Request } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';

export class UserController {
  // Lấy thông tin user profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const { name, email, phone, oldPassword, newPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (newPassword) {
        if (!oldPassword) return res.status(400).json({ message: 'Cần nhập mật khẩu cũ để đổi mật khẩu' });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        user.password = await bcrypt.hash(newPassword, 10);
      }
      await user.save();
      res.json({ message: 'Cập nhật thành công' });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Lấy bài đăng đã duyệt của user
  static async getApprovedPosts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const posts = await UserService.getApprovedPosts(userId);
      res.json({
        message: 'Lấy bài đăng đã duyệt thành công',
        posts
      });
    } catch (error: any) {
      console.error('Get approved posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lấy bài đăng chờ duyệt của user
  static async getPendingPosts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const posts = await UserService.getPendingPosts(userId);
      res.json({
        message: 'Lấy bài đăng chờ duyệt thành công',
        posts
      });
    } catch (error: any) {
      console.error('Get pending posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lấy tất cả bài đăng của user
  static async getAllPosts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const posts = await UserService.getAllUserPosts(userId);
      res.json({
        message: 'Lấy tất cả bài đăng thành công',
        posts
      });
    } catch (error: any) {
      console.error('Get all posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lấy thống kê bài đăng của user
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const stats = await UserService.getUserStats(userId);
      res.json({
        message: 'Lấy thống kê thành công',
        stats
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lấy dashboard data (profile + stats + posts)
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const [profile, stats, approvedPosts, pendingPosts] = await Promise.all([
        UserService.getUserProfile(userId),
        UserService.getUserStats(userId),
        UserService.getApprovedPosts(userId),
        UserService.getPendingPosts(userId)
      ]);

      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Lấy dashboard thành công',
        dashboard: {
          profile,
          stats,
          approvedPosts,
          pendingPosts
        }
      });
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id).select('name email phone');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
} 