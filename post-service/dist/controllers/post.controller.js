"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_service_1 = require("../services/post.service");
class PostController {
    static async create(req, res) {
        let images = [];
        if (req.files && Array.isArray(req.files)) {
            images = req.files.map((file) => '/uploads/' + file.filename);
        }
        const post = await post_service_1.PostService.createPost({
            ...req.body,
            images,
        });
        res.json(post);
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
}
exports.PostController = PostController;
