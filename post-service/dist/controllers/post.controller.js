"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_service_1 = require("../services/post.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
class PostController {
    static async create(req, res) {
        try {
            // Lấy userId từ JWT token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'No token provided' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            let images = [];
            // Xử lý ảnh từ files
            if (req.files && Array.isArray(req.files)) {
                // Sử dụng localhost:3000 thay vì internal Docker hostname
                const baseUrl = 'http://localhost:3000';
                images = req.files.map((file) => `${baseUrl}/posts/images/${file.filename}`);
                console.log('Created image URLs:', images);
            }
            // Xử lý ảnh từ body (nếu đã upload qua media service)
            if (req.body.images) {
                if (Array.isArray(req.body.images)) {
                    images = [...images, ...req.body.images];
                }
                else {
                    images.push(req.body.images);
                }
            }
            const post = await post_service_1.PostService.createPost({
                ...req.body,
                authorId: userId,
                images,
            });
            res.json(post);
        }
        catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
    static async getAll(req, res) {
        const posts = await post_service_1.PostService.getAllPosts();
        res.json(posts);
    }
    static async getOne(req, res) {
        const post = await post_service_1.PostService.getPostById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    }
    static async getPending(req, res) {
        const posts = await post_service_1.PostService.getPendingPosts();
        res.json(posts);
    }
    static async getApproved(req, res) {
        const posts = await post_service_1.PostService.getApprovedPosts();
        res.json(posts);
    }
    static async approve(req, res) {
        const post = await post_service_1.PostService.approvePost(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    }
    static async update(req, res) {
        try {
            const post = await post_service_1.PostService.updatePost(req.params.id, req.body);
            if (!post)
                return res.status(404).json({ message: 'Post not found' });
            res.json(post);
        }
        catch (error) {
            console.error('Update post error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
    static async delete(req, res) {
        try {
            // Lấy userId từ JWT token để kiểm tra quyền
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'No token provided' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const userRole = decoded.role;
            const post = await post_service_1.PostService.getPostById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            // Chỉ cho phép admin hoặc tác giả bài đăng xóa
            if (userRole !== 'admin' && post.authorId !== userId) {
                return res.status(403).json({ message: 'Unauthorized to delete this post' });
            }
            const deletedPost = await post_service_1.PostService.deletePost(req.params.id);
            res.json({ message: 'Post deleted successfully', post: deletedPost });
        }
        catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
exports.PostController = PostController;
