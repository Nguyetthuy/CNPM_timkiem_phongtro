// ===============================
// auth-service/src/index.ts
// ===============================
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
import User from './models/user.model';
import bcrypt from 'bcryptjs';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'auth-service', 
    timestamp: new Date().toISOString() 
  });
});

// Mount auth routes at root (gateway sẽ proxy /api/auth/* -> /*)
app.use('/', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/login',
      '/register', 
      '/user/:id'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Auth service error:', err);
  res.status(500).json({ error: 'Internal auth service error' });
});

mongoose.connect('mongodb://mongo:27017/findhouse').then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Tạo admin mặc định nếu chưa có
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    console.log('🔍 Admin user check:', admin ? 'Found' : 'Not found');
    
    const hashed = await bcrypt.hash('12345', 10);
    if (!admin) {
      const newAdmin = await User.create({ 
        name: 'Admin', 
        email: 'admin@gmail.com', 
        password: hashed, 
        role: 'admin' 
      });
      console.log('✅ Tạo tài khoản admin mặc định thành công:', newAdmin.email);
    } else {
      let needUpdate = false;
      if (admin.role !== 'admin') { 
        admin.role = 'admin'; 
        needUpdate = true; 
        console.log('🔄 Cập nhật role admin');
      }
      
      // So sánh password đã hash
      const bcryptCompare = await bcrypt.compare('12345', admin.password);
      if (!bcryptCompare) { 
        admin.password = hashed; 
        needUpdate = true; 
        console.log('🔄 Cập nhật password admin');
      }
      
      if (needUpdate) {
        await admin.save();
        console.log('✅ Cập nhật tài khoản admin thành công: admin@gmail.com/12345');
      } else {
        console.log('✅ Tài khoản admin đã tồn tại và đúng: admin@gmail.com/12345');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo/cập nhật admin user:', error);
  }
  
  app.listen(3001, () => {
    console.log('🚀 Auth service running on port 3001');
    console.log('📋 Available routes:');
    console.log('   - /health (health check)');
    console.log('   - /login (POST)');
    console.log('   - /register (POST)');
    console.log('   - /user/:id (GET)');
  });
}).catch(error => {
  console.error('❌ Lỗi kết nối MongoDB:', error);
});
