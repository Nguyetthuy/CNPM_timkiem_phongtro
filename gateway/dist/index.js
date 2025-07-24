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
// KHÔNG dùng express.json và express.urlencoded cho /posts
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
            posts: '/posts*',
            user: '/user/*'
        }
    });
});
// Proxy riêng các route profile và user sang user-service
app.use('/api/auth/profile', (0, express_http_proxy_1.default)('http://user-service:3004'));
app.use('/api/auth/user', (0, express_http_proxy_1.default)('http://user-service:3004'));
// Proxy auth tổng quát
app.use('/api/auth', express_1.default.json({ limit: '10mb' }), express_1.default.urlencoded({ extended: true, limit: '10mb' }), (0, express_http_proxy_1.default)('http://auth-service:3001', {
    proxyReqPathResolver: (req) => {
        return req.url.replace('/api/auth', '');
    },
    proxyErrorHandler: (err, res, next) => {
        console.error('Auth service proxy error:', err);
        res.status(500).json({ error: 'Auth service unavailable' });
    }
}));
// Post service proxy - KHÔNG dùng express.json cho multipart
app.use('/posts', (0, express_http_proxy_1.default)('http://post-service:3002', {
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
app.use('/user', express_1.default.json({ limit: '10mb' }), express_1.default.urlencoded({ extended: true, limit: '10mb' }), (0, express_http_proxy_1.default)('http://user-service:3004', {
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
            '/posts*',
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
    console.log('   - /posts* (post service)');
    console.log('   - /user/* (user service)');
});
