import Post from '../models/post.model';

export class PostService {
  static async createPost(data: any) {
    if (!data.status) data.status = 'pending';
    if (!data.createdAt) data.createdAt = new Date().toISOString();
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

  static async searchPosts(filters: any) {
    const query: any = {};
    if (filters.minPrice !== undefined) query.price = { ...query.price, $gte: Number(filters.minPrice) };
    if (filters.maxPrice !== undefined) query.price = { ...query.price, $lte: Number(filters.maxPrice) };
    if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
    if (filters.keyword) {
      const kw = filters.keyword;
      query.$or = [
        { title: { $regex: kw, $options: 'i' } },
        { content: { $regex: kw, $options: 'i' } },
        { note: { $regex: kw, $options: 'i' } },
        { location: { $regex: kw, $options: 'i' } }
      ];
    }
    // Nếu không truyền status, mặc định chỉ lấy bài đã duyệt
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'approved';
    }
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(query)
    ]);
    return { results, total };
  }

  static async addCreatedAtToOldPosts() {
    const now = new Date().toISOString();
    await Post.updateMany({ createdAt: { $exists: false } }, { $set: { createdAt: now } });
  }
}
