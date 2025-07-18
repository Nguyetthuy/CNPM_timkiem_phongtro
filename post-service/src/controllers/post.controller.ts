import { Request, Response } from 'express';
import { PostService } from '../services/post.service';

export class PostController {
  static async create(req: Request, res: Response) {
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file: any) => '/uploads/' + file.filename);
    }
    const post = await PostService.createPost({
      ...req.body,
      images,
    });
    res.json(post);
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
