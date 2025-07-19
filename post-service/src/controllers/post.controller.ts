import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export class PostController {
  static async create(req: Request, res: Response) {
    try {
      // Lấy userId từ JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;

      let images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        images = req.files.map((file: any) => '/uploads/' + file.filename);
      }
      
      const post = await PostService.createPost({
        ...req.body,
        authorId: userId,
        images,
      });
      res.json(post);
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    const posts = await PostService.getAllPosts();
    res.json(posts);
  }

  static async getOne(req: Request, res: Response) {
    const post = await PostService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  }

  static async getPending(req: Request, res: Response) {
    const posts = await PostService.getPendingPosts();
    res.json(posts);
  }

  static async getApproved(req: Request, res: Response) {
    const posts = await PostService.getApprovedPosts();
    res.json(posts);
  }

  static async approve(req: Request, res: Response) {
    const post = await PostService.approvePost(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  }
}
