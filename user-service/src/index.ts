// ===============================
// user-service/src/index.ts
// ===============================
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

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
    service: 'user-service', 
    timestamp: new Date().toISOString() 
  });
});

// Routes - mount user routes ở root (gateway sẽ proxy /user/* -> /*)
app.use('/', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/dashboard',
      '/profile',
      '/posts/approved',
      '/posts/pending',
      '/posts',
      '/stats'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('User service error:', err);
  res.status(500).json({ error: 'Internal user service error' });
});

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/findhouse').then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log('🚀 User service running on port', PORT);
    console.log('📋 Available routes:');
    console.log('   - /health (health check)');
    console.log('   - /dashboard (GET - user dashboard)');
    console.log('   - /profile (GET - user profile)');
    console.log('   - /posts/approved (GET - approved posts)');
    console.log('   - /posts/pending (GET - pending posts)');
    console.log('   - /posts (GET - all user posts)');
    console.log('   - /stats (GET - user stats)');
  });
}).catch(error => {
  console.error('❌ Lỗi kết nối MongoDB:', error);
}); 