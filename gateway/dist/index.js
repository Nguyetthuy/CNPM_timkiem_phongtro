"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ===============================
// gateway/src/index.ts
// ===============================
const express_1 = __importDefault(require("express"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
// Logging middleware
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'gateway',
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/api/auth/*',
            posts: '/posts/*',
            media: '/media/*',
            user: '/user/*'
        }
    });
});
// Proxy routes - Đảm bảo khớp với frontend API calls
app.use('/api/auth', (0, express_http_proxy_1.default)('http://auth-service:3001', {
    proxyReqPathResolver: (req) => {
        // Loại bỏ /api/auth prefix khi forward đến auth-service
        return req.url.replace('/api/auth', '');
    },
    proxyErrorHandler: (err, res, next) => {
        console.error('Auth service proxy error:', err);
        res.status(500).json({ error: 'Auth service unavailable' });
    }
}));
app.use('/posts', (0, express_http_proxy_1.default)('http://post-service:3002', {
    proxyErrorHandler: (err, res, next) => {
        console.error('Post service proxy error:', err);
        res.status(500).json({ error: 'Post service unavailable' });
    }
}));
// Media service proxy - xử lý multipart request đặc biệt
app.use('/media', (0, express_http_proxy_1.default)('http://media-service:3003', {
    // Không parse body cho multipart requests
    parseReqBody: false,
    // Forward tất cả headers
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        // Đảm bảo Content-Type và boundary được giữ nguyên
        if (srcReq.headers['content-type'] && proxyReqOpts.headers) {
            proxyReqOpts.headers['content-type'] = srcReq.headers['content-type'];
        }
        return proxyReqOpts;
    },
    proxyErrorHandler: (err, res, next) => {
        console.error('Media service proxy error:', err);
        res.status(500).json({ error: 'Media service unavailable' });
    }
}));
app.use('/user', (0, express_http_proxy_1.default)('http://user-service:3004', {
    proxyErrorHandler: (err, res, next) => {
        console.error('User service proxy error:', err);
        res.status(500).json({ error: 'User service unavailable' });
    }
}));
// 404 handler
app.use('*', (req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            '/health',
            '/api/auth/*',
            '/posts/*',
            '/media/*',
            '/user/*'
        ]
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({ error: 'Internal gateway error' });
});
app.listen(3000, () => {
    console.log('🚀 API Gateway running on port 3000');
    console.log('📋 Available routes:');
    console.log('   - /health (health check)');
    console.log('   - /api/auth/* (auth service)');
    console.log('   - /posts/* (post service)');
    console.log('   - /media/* (media service)');
    console.log('   - /user/* (user service)');
});
