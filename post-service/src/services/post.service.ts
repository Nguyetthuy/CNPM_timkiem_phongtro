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

  static async updatePost(id: string, data: any) {
    return await Post.findByIdAndUpdate(id, data, { new: true });
  }

  static async getApprovedPosts() {
    return await Post.find({ status: 'approved' });
  }

  static async deletePost(id: string) {
    return await Post.findByIdAndDelete(id);
  }
}
