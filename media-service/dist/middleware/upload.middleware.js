"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMultipartRequest = exports.handleUploadError = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Cấu hình storage cho multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images/');
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique với timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Filter để chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)'));
    }
};
// Cấu hình multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
        files: 10 // Tối đa 10 file
    }
});
// Middleware để validate multipart request
const validateMultipartRequest = (req, res, next) => {
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    const contentType = req.headers['content-type'];
    if (!contentType) {
        return res.status(400).json({ error: 'Content-Type header is required' });
    }
    if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }
    if (!contentType.includes('boundary=')) {
        return res.status(400).json({ error: 'Multipart boundary is required' });
    }
    next();
};
exports.validateMultipartRequest = validateMultipartRequest;
// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    console.error('Upload error:', err);
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File quá lớn. Tối đa 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Quá nhiều file. Tối đa 10 file' });
        }
    }
    if (err.message.includes('Chỉ cho phép upload file ảnh')) {
        return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('Boundary not found')) {
        return res.status(400).json({
            error: 'Invalid multipart request. Please check Content-Type header.',
            details: 'Request must include proper multipart boundary'
        });
    }
    next(err);
};
exports.handleUploadError = handleUploadError;
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map