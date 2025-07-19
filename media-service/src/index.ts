import express from 'express';
import cors from 'cors';
import path from 'path';
import mediaRoutes from './routes/media.routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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
    service: 'media-service', 
    timestamp: new Date().toISOString() 
  });
});

// Serve static files (ảnh)
app.use('/images', express.static(path.join(__dirname, '../uploads/images')));

// Routes - mount media routes ở root để nhận /upload và /media/upload
app.use('/', mediaRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/upload',
      '/images/*',
      '/media/upload',
      '/media/images/*'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Media service error:', err);
  res.status(500).json({ error: 'Internal media service error' });
});

app.listen(PORT, () => {
  console.log('🚀 Media service running on port', PORT);
  console.log('📋 Available routes:');
  console.log('   - /health (health check)');
  console.log('   - /upload (POST - upload images)');
  console.log('   - /images/* (GET - serve images)');
  console.log('   - /media/upload (POST - upload images)');
  console.log('   - /media/images/* (GET - serve images)');
}); 