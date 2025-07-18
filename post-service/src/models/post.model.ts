import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  status: { type: String, default: 'pending' }, // Thêm trường status
  images: [String], // Thêm trường images
});

export default mongoose.model('Post', postSchema);
