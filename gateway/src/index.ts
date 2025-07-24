// ===============================
// gateway/src/index.ts
// ===============================
import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
// KHÔNG dùng express.json và express.urlencoded cho /posts

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
      user: '/user/*'
    }
  });
});

// Proxy riêng các route profile và user sang user-service
app.get('/api/auth/profile', proxy('http://user-service:3004', {
  proxyReqPathResolver: req => {
    console.log('[Gateway DEBUG] req.url:', req.url);
    return '/profile';
  }
}));
// Proxy public lấy user theo id (bắt mọi method)
app.all('/api/auth/user/:id', proxy('http://user-service:3004', {
  proxyReqPathResolver: req => `/user/${req.params.id}`
}));
// Proxy public hoàn toàn mới lấy user theo id
app.get('/api/user-public/:id', proxy('http://user-service:3004', {
  proxyReqPathResolver: req => `/user/${req.params.id}`
}));
// Proxy tổng quát cho /api/auth
app.use('/api/auth', (req, res, next) => {
  console.log('[Gateway DEBUG] req.url:', req.url, '| req.originalUrl:', req.originalUrl, '| req.baseUrl:', req.baseUrl, '| req.path:', req.path);
  if (req.path === '/profile' || req.path === '/profile/') {
    return proxy('http://user-service:3004', {
      proxyReqPathResolver: req => req.originalUrl.replace('/api/auth', '')
    })(req, res, next);
  }
  // XÓA nhánh if (req.path.startsWith('/user'))
  // Mặc định sang auth-service
  return proxy('http://auth-service:3001', {
    proxyReqPathResolver: req => req.originalUrl.replace('/api/auth', ''),
    proxyErrorHandler: (err, res, next) => {
      console.error('Auth service proxy error:', err);
      res.status(500).json({ error: 'Auth service unavailable' });
    }
  })(req, res, next);
});

// Post service proxy - KHÔNG dùng express.json cho multipart
app.use('/posts', proxy('http://post-service:3002', {
  limit: '10mb',
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

app.use('/user', express.json({ limit: '10mb' }), express.urlencoded({ extended: true, limit: '10mb' }), proxy('http://user-service:3004', {
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
  console.log('   - /user/* (user service)');
});
