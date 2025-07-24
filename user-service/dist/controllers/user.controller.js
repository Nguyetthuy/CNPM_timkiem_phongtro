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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    // Lấy thông tin user profile
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const user = yield user_model_1.default.findById(userId).select('-password');
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                res.json(user);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const { name, email, phone, oldPassword, newPassword } = req.body;
                const user = yield user_model_1.default.findById(userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                if (name)
                    user.name = name;
                if (email)
                    user.email = email;
                if (phone)
                    user.phone = phone;
                if (newPassword) {
                    if (!oldPassword)
                        return res.status(400).json({ message: 'Cần nhập mật khẩu cũ để đổi mật khẩu' });
                    const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
                    if (!isMatch)
                        return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
                    user.password = yield bcryptjs_1.default.hash(newPassword, 10);
                }
                yield user.save();
                res.json({ message: 'Cập nhật thành công' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
    // Lấy bài đăng đã duyệt của user
    static getApprovedPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
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
                const userId = req.user.userId;
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
                const userId = req.user.userId;
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
                const userId = req.user.userId;
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
                const userId = req.user.userId;
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
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findById(req.params.id).select('name email');
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                res.json(user);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
