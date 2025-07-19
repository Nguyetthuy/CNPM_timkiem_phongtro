"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
class MediaService {
    constructor() {
        this.uploadDir = 'uploads/images/';
    }
    // Upload và xử lý ảnh
    async uploadImage(file) {
        try {
            const imagePath = path_1.default.join(this.uploadDir, file.filename);
            // Tạo thumbnail (tùy chọn)
            await this.createThumbnail(imagePath);
            const imageInfo = {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                path: imagePath,
                url: `/images/${file.filename}`
            };
            return imageInfo;
        }
        catch (error) {
            throw new Error(`Lỗi upload ảnh: ${error}`);
        }
    }
    // Tạo thumbnail
    async createThumbnail(imagePath) {
        try {
            const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
            await (0, sharp_1.default)(imagePath)
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
        }
        catch (error) {
            console.error('Lỗi tạo thumbnail:', error);
            // Không throw error vì thumbnail không bắt buộc
        }
    }
    // Lấy thông tin ảnh
    async getImageInfo(filename) {
        try {
            const imagePath = path_1.default.join(this.uploadDir, filename);
            if (!fs_1.default.existsSync(imagePath)) {
                return null;
            }
            const stats = fs_1.default.statSync(imagePath);
            const ext = path_1.default.extname(filename);
            const mimetype = this.getMimeType(ext);
            return {
                filename,
                originalName: filename,
                size: stats.size,
                mimetype,
                path: imagePath,
                url: `/images/${filename}`
            };
        }
        catch (error) {
            throw new Error(`Lỗi lấy thông tin ảnh: ${error}`);
        }
    }
    // Xóa ảnh
    async deleteImage(filename) {
        try {
            const imagePath = path_1.default.join(this.uploadDir, filename);
            const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
            // Xóa ảnh gốc
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
            // Xóa thumbnail nếu có
            if (fs_1.default.existsSync(thumbnailPath)) {
                fs_1.default.unlinkSync(thumbnailPath);
            }
            return true;
        }
        catch (error) {
            throw new Error(`Lỗi xóa ảnh: ${error}`);
        }
    }
    // Lấy danh sách ảnh
    async listImages() {
        try {
            const files = fs_1.default.readdirSync(this.uploadDir);
            const images = [];
            for (const file of files) {
                if (file.includes('_thumb'))
                    continue; // Bỏ qua thumbnail
                const imageInfo = await this.getImageInfo(file);
                if (imageInfo) {
                    images.push(imageInfo);
                }
            }
            return images;
        }
        catch (error) {
            throw new Error(`Lỗi lấy danh sách ảnh: ${error}`);
        }
    }
    // Lấy MIME type từ extension
    getMimeType(ext) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
    }
}
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map