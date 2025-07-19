"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});
// Serve static files (ảnh)
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../uploads/images')));
// Routes - mount ở cả /media và root
app.use('/media', media_routes_1.default);
app.use('/', media_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'media-service', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`Media service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map