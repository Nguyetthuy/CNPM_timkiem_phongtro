"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ===============================
// user-service/src/index.ts
// ===============================
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/', user_routes_1.default);
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
app.use((err, req, res, next) => {
    console.error('User service error:', err);
    res.status(500).json({ error: 'Internal user service error' });
});
// Connect to MongoDB
mongoose_1.default.connect('mongodb://mongo:27017/findhouse').then(() => {
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
