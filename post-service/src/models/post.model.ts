import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  authorId: String, // Thêm trường authorId để lưu userId
  status: { type: String, default: 'pending' }, // Thêm trường status
  images: [{ type: String }], // Thêm trường images để lưu URL ảnh
  price: { type: Number, required: false }, // Thêm trường giá
  location: { type: String, required: false }, // Thêm trường vị trí
});

export default mongoose.model('Post', postSchema);
