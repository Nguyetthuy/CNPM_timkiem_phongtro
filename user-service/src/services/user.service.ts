// ===============================
// user-service/src/services/user.service.ts
// ===============================
import mongoose from 'mongoose';

// Interface cho Post (sử dụng cùng schema với post-service)
interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  status: string;
  images?: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface cho User
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export class UserService {
  // Lấy thông tin user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Kết nối đến collection users trong auth-service
      const userCollection = mongoose.connection.collection('users');
      const user = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
      
      if (!user) return null;
      
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Lấy bài đăng đã duyệt của user
  static async getApprovedPosts(userId: string): Promise<Post[]> {
    try {
      const postCollection = mongoose.connection.collection('posts');
      const posts = await postCollection.find({
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
    } catch (error) {
      console.error('Get approved posts error:', error);
      throw error;
    }
  }

  // Lấy bài đăng chờ duyệt của user
  static async getPendingPosts(userId: string): Promise<Post[]> {
    try {
      const postCollection = mongoose.connection.collection('posts');
      const posts = await postCollection.find({
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
    } catch (error) {
      console.error('Get pending posts error:', error);
      throw error;
    }
  }

  // Lấy tất cả bài đăng của user
  static async getAllUserPosts(userId: string): Promise<Post[]> {
    try {
      const postCollection = mongoose.connection.collection('posts');
      const posts = await postCollection.find({
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
    } catch (error) {
      console.error('Get all user posts error:', error);
      throw error;
    }
  }

  // Lấy thống kê bài đăng của user
  static async getUserStats(userId: string) {
    try {
      const postCollection = mongoose.connection.collection('posts');
      
      const totalPosts = await postCollection.countDocuments({ authorId: userId });
      const approvedPosts = await postCollection.countDocuments({ 
        authorId: userId, 
        status: 'approved' 
      });
      const pendingPosts = await postCollection.countDocuments({ 
        authorId: userId, 
        status: 'pending' 
      });
      
      return {
        totalPosts,
        approvedPosts,
        pendingPosts
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }
} 