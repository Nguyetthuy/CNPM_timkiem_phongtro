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
exports.UserService = void 0;
// ===============================
// user-service/src/services/user.service.ts
// ===============================
const mongoose_1 = __importDefault(require("mongoose"));
class UserService {
    // Lấy thông tin user profile
    static getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kết nối đến collection users trong auth-service
                const userCollection = mongoose_1.default.connection.collection('users');
                const user = yield userCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(userId) });
                if (!user)
                    return null;
                return {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
            catch (error) {
                console.error('Get user profile error:', error);
                throw error;
            }
        });
    }
    // Lấy bài đăng đã duyệt của user
    static getApprovedPosts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postCollection = mongoose_1.default.connection.collection('posts');
                const posts = yield postCollection.find({
                    authorId: userId,
                    status: 'approved'
                }).sort({ createdAt: -1 }).toArray();
                return posts.map(post => ({
                    _id: post._id.toString(),
                    title: post.title,
                    content: post.content,
                    author: post.author,
                    authorId: post.authorId,
                    status: post.status,
                    images: post.images || [],
                    note: post.note,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }));
            }
            catch (error) {
                console.error('Get approved posts error:', error);
                throw error;
            }
        });
    }
    // Lấy bài đăng chờ duyệt của user
    static getPendingPosts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postCollection = mongoose_1.default.connection.collection('posts');
                const posts = yield postCollection.find({
                    authorId: userId,
                    status: 'pending'
                }).sort({ createdAt: -1 }).toArray();
                return posts.map(post => ({
                    _id: post._id.toString(),
                    title: post.title,
                    content: post.content,
                    author: post.author,
                    authorId: post.authorId,
                    status: post.status,
                    images: post.images || [],
                    note: post.note,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }));
            }
            catch (error) {
                console.error('Get pending posts error:', error);
                throw error;
            }
        });
    }
    // Lấy tất cả bài đăng của user
    static getAllUserPosts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postCollection = mongoose_1.default.connection.collection('posts');
                const posts = yield postCollection.find({
                    authorId: userId
                }).sort({ createdAt: -1 }).toArray();
                return posts.map(post => ({
                    _id: post._id.toString(),
                    title: post.title,
                    content: post.content,
                    author: post.author,
                    authorId: post.authorId,
                    status: post.status,
                    images: post.images || [],
                    note: post.note,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }));
            }
            catch (error) {
                console.error('Get all user posts error:', error);
                throw error;
            }
        });
    }
    // Lấy thống kê bài đăng của user
    static getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postCollection = mongoose_1.default.connection.collection('posts');
                const totalPosts = yield postCollection.countDocuments({ authorId: userId });
                const approvedPosts = yield postCollection.countDocuments({
                    authorId: userId,
                    status: 'approved'
                });
                const pendingPosts = yield postCollection.countDocuments({
                    authorId: userId,
                    status: 'pending'
                });
                return {
                    totalPosts,
                    approvedPosts,
                    pendingPosts
                };
            }
            catch (error) {
                console.error('Get user stats error:', error);
                throw error;
            }
        });
    }
}
exports.UserService = UserService;
