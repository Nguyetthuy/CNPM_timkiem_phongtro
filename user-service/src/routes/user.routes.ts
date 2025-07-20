// ===============================
// user-service/src/routes/user.routes.ts
// ===============================
import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Dashboard - lấy tất cả thông tin user
router.get('/dashboard', UserController.getDashboard);

// Profile
router.get('/profile', UserController.getProfile);

// Posts
router.get('/posts/approved', UserController.getApprovedPosts);
router.get('/posts/pending', UserController.getPendingPosts);
router.get('/posts', UserController.getAllPosts);

// Stats
router.get('/stats', UserController.getStats);

export default router; 