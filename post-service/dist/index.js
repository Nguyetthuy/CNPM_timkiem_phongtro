"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
    next();
});
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'post-service',
        timestamp: new Date().toISOString()
    });
});
// Mount post routes
app.use('/posts', post_routes_1.default);
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
app.use((err, req, res, next) => {
    console.error('Post service error:', err);
    res.status(500).json({ error: 'Internal post service error' });
});
mongoose_1.default
    .connect('mongodb://mongo:27017/findhouse')
    .then(() => {
    console.log('✅ Connected to MongoDB');
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
