"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    // Lấy thông tin user profile
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const profile = yield user_service_1.UserService.getUserProfile(userId);
                if (!profile) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.json({
                    message: 'Lấy thông tin profile thành công',
                    profile
                });
            }
            catch (error) {
                console.error('Get profile error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Lấy bài đăng đã duyệt của user
    static getApprovedPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const posts = yield user_service_1.UserService.getApprovedPosts(userId);
                res.json({
                    message: 'Lấy bài đăng đã duyệt thành công',
                    posts
                });
            }
            catch (error) {
                console.error('Get approved posts error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Lấy bài đăng chờ duyệt của user
    static getPendingPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const posts = yield user_service_1.UserService.getPendingPosts(userId);
                res.json({
                    message: 'Lấy bài đăng chờ duyệt thành công',
                    posts
                });
            }
            catch (error) {
                console.error('Get pending posts error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Lấy tất cả bài đăng của user
    static getAllPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const posts = yield user_service_1.UserService.getAllUserPosts(userId);
                res.json({
                    message: 'Lấy tất cả bài đăng thành công',
                    posts
                });
            }
            catch (error) {
                console.error('Get all posts error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Lấy thống kê bài đăng của user
    static getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const stats = yield user_service_1.UserService.getUserStats(userId);
                res.json({
                    message: 'Lấy thống kê thành công',
                    stats
                });
            }
            catch (error) {
                console.error('Get stats error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    // Lấy dashboard data (profile + stats + posts)
    static getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ error: 'User ID not found' });
                }
                const [profile, stats, approvedPosts, pendingPosts] = yield Promise.all([
                    user_service_1.UserService.getUserProfile(userId),
                    user_service_1.UserService.getUserStats(userId),
                    user_service_1.UserService.getApprovedPosts(userId),
                    user_service_1.UserService.getPendingPosts(userId)
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
            }
            catch (error) {
                console.error('Get dashboard error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.UserController = UserController;
