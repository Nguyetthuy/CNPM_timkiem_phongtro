// ===============================
// gateway/src/index.ts
// ===============================
import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    service: 'gateway', 
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth/*',
      posts: '/posts*',
      media: '/media/*',
      user: '/user/*'
    }
  });
});

// Proxy routes - Đảm bảo khớp với frontend API calls
app.use('/api/auth', proxy('http://auth-service:3001', {
  proxyReqPathResolver: (req) => {
    // Loại bỏ /api/auth prefix khi forward đến auth-service
    return req.url.replace('/api/auth', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Auth service proxy error:', err);
    res.status(500).json({ error: 'Auth service unavailable' });
  }
}));

// Post service proxy - sử dụng /posts* để match cả /posts và /posts/*
app.use('/posts', proxy('http://post-service:3002', {
  proxyReqPathResolver: (req) => {
    // Forward đến /posts path trong post-service, giữ nguyên phần còn lại của URL
    const path = req.url;
    console.log(`[Gateway] Proxying /posts${path} to post-service`);
    return `/posts${path}`;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Post service proxy error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Post service unavailable' });
    }
  }
}));

// Media service proxy - xử lý multipart request đặc biệt
app.use('/media', proxy('http://media-service:3003', {
  // Forward tất cả headers và body
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Đảm bảo Content-Type và boundary được giữ nguyên
    if (srcReq.headers['content-type'] && proxyReqOpts.headers) {
      (proxyReqOpts.headers as any)['content-type'] = srcReq.headers['content-type'];
    }
    
    // Forward Content-Length nếu có
    if (srcReq.headers['content-length'] && proxyReqOpts.headers) {
      (proxyReqOpts.headers as any)['content-length'] = srcReq.headers['content-length'];
    }
    
    // Forward Transfer-Encoding nếu có
    if (srcReq.headers['transfer-encoding'] && proxyReqOpts.headers) {
      (proxyReqOpts.headers as any)['transfer-encoding'] = srcReq.headers['transfer-encoding'];
    }
    
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Media service proxy error:', err);
    res.status(500).json({ error: 'Media service unavailable' });
  }
}));

app.use('/user', proxy('http://user-service:3004', {
  proxyErrorHandler: (err, res, next) => {
    console.error('User service proxy error:', err);
    res.status(500).json({ error: 'User service unavailable' });
  }
}));

// 404 handler
app.use('*', (req: Request, res: Response) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/health',
      '/api/auth/*',
      '/posts*', 
      '/media/*',
      '/user/*'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
});

app.listen(3000, () => {
  console.log('🚀 API Gateway running on port 3000');
  console.log('📋 Available routes:');
  console.log('   - /health (health check)');
  console.log('   - /api/auth/* (auth service)');
  console.log('   - /posts* (post service)');
  console.log('   - /media/* (media service)');
  console.log('   - /user/* (user service)');
});
