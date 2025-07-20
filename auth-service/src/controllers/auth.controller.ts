// ===============================
// auth-service/src/controllers/auth.controller.ts
// ===============================
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const result = await AuthService.getUserById(req.params.id);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(404).json({ message: 'User not found', error: error.message });
    }
  }
}