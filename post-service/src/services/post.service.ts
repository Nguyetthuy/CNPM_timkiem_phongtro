import Post from '../models/post.model';

export class PostService {
  static async createPost(data: any) {
    if (!data.status) data.status = 'pending';
    return await Post.create(data);
  }

  static async getAllPosts() {
    return await Post.find();
  }

  static async getPostById(id: string) {
    return await Post.findById(id);
  }

  static async getPendingPosts() {
    return await Post.find({ status: 'pending' });
  }

  static async approvePost(id: string) {
    return await Post.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
  }
}
