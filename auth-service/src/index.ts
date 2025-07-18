// ===============================
// auth-service/src/index.ts
// ===============================
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
import User from './models/user.model';
import bcrypt from 'bcryptjs';

dotenv.config();
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use('/', authRoutes);

mongoose.connect('mongodb://mongo:27017/findhouse').then(async () => {
  // Tạo admin mặc định nếu chưa có
  const admin = await User.findOne({ email: 'admin@gmail.com' });
  const hashed = await bcrypt.hash('12345', 10);
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@gmail.com', password: hashed, role: 'admin' });
    console.log('Tạo tài khoản admin mặc định: admin@gmail.com/12345');
  } else {
    let needUpdate = false;
    if (admin.role !== 'admin') { admin.role = 'admin'; needUpdate = true; }
    // So sánh password đã hash
    const bcryptCompare = await bcrypt.compare('12345', admin.password);
    if (!bcryptCompare) { admin.password = hashed; needUpdate = true; }
    if (needUpdate) {
      await admin.save();
      console.log('Cập nhật lại tài khoản admin mặc định: admin@gmail.com/12345');
    }
  }
  app.listen(3001, () => console.log('Auth service on port 3001'));
});
