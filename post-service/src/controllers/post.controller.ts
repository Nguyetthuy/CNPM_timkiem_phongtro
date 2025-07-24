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
      
      // Xử lý ảnh từ files
      if (req.files && Array.isArray(req.files)) {
        // Sử dụng localhost:3000 thay vì internal Docker hostname
        const baseUrl = 'http://localhost:3000';
        images = req.files.map((file: any) => `${baseUrl}/posts/images/${file.filename}`);
        console.log('Created image URLs:', images);
      }
      
      // Xử lý ảnh từ body (nếu đã upload qua media service)
      if (req.body.images) {
        if (Array.isArray(req.body.images)) {
          images = [...images, ...req.body.images];
        } else {
          images.push(req.body.images);
        }
      }
      
      const post = await PostService.createPost({
        ...req.body,
        authorId: userId,
        images,
        createdAt: req.body.createdAt || new Date().toISOString(),
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

  static async update(req: Request, res: Response) {
    try {
      const post = await PostService.updatePost(req.params.id, req.body);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.json(post);
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Lấy userId từ JWT token để kiểm tra quyền
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;
      const userRole = decoded.role;

      const post = await PostService.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Xóa file ảnh vật lý nếu có
      if (post.images && Array.isArray(post.images)) {
        const fs = require('fs');
        const path = require('path');
        post.images.forEach((imgUrl: string) => {
          // Lấy tên file từ URL
          const filename = imgUrl.split('/').pop();
          if (filename) {
            const filePath = path.join(__dirname, '../../uploads/images', filename);
            fs.unlink(filePath, (err: any) => {
              if (err) {
                console.error('Không thể xóa file:', filePath, err.message);
              }
            });
          }
        });
      }

      // Chỉ cho phép admin hoặc tác giả bài đăng xóa
      if (userRole !== 'admin' && post.authorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete this post' });
      }

      const deletedPost = await PostService.deletePost(req.params.id);
      res.json({ message: 'Post deleted successfully', post: deletedPost });
    } catch (error: any) {
      console.error('Delete post error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { results, total } = await PostService.searchPosts(req.query);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      res.json({ results, total, page, limit });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async ratePost(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const { rating } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
      }
      const post = await PostService.getPostById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      // Thêm rating mới vào mảng ratings
      post.ratings = post.ratings || [];
      post.ratings.push(rating);
      post.ratingCount = post.ratings.length;
      post.ratingAvg = post.ratings.reduce((a: number, b: number) => a + b, 0) / post.ratingCount;
      await post.save();
      res.json({ ratingAvg: post.ratingAvg, ratingCount: post.ratingCount });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}
