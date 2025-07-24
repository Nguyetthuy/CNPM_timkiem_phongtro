import express from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/post.routes';
import path from 'path';
import cors from 'cors';
import { PostService } from './services/post.service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'post-service', 
    timestamp: new Date().toISOString() 
  });
});

// Mount post routes
app.use('/posts', postRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/posts/*'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Post service error:', err);
  res.status(500).json({ error: 'Internal post service error' });
});

mongoose
  .connect('mongodb://mongo:27017/findhouse')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Cập nhật createdAt cho các bài post cũ nếu thiếu
    await PostService.addCreatedAtToOldPosts();
    app.listen(3002, () => {
      console.log('🚀 Post service running on port 3002');
      console.log('📋 Available routes:');
      console.log('   - /health (health check)');
      console.log('   - /posts/* (post routes)');
    });
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
  });
