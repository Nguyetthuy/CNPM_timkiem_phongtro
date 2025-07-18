import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  status: { type: String, default: 'pending' }, // Thêm trường status
});

export default mongoose.model('Post', postSchema);
