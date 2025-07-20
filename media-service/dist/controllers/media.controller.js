"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const media_service_1 = require("../services/media.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MediaController {
    constructor() {
        this.mediaService = new media_service_1.MediaService();
    }
    // Upload ảnh
    async uploadImage(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Không có file nào được upload' });
            }
            const files = req.files;
            const uploadedImages = [];
            for (const file of files) {
                const imageInfo = await this.mediaService.uploadImage(file);
                uploadedImages.push(imageInfo);
            }
            res.status(200).json({
                message: 'Upload ảnh thành công',
                images: uploadedImages
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // Lấy ảnh
    async getImage(req, res) {
        try {
            const { filename } = req.params;
            const imagePath = path_1.default.join('uploads/images', filename);
            if (!fs_1.default.existsSync(imagePath)) {
                return res.status(404).json({ error: 'Không tìm thấy ảnh' });
            }
            res.sendFile(path_1.default.resolve(imagePath));
        }
        catch (error) {
            console.error('Get image error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // Lấy thông tin ảnh
    async getImageInfo(req, res) {
        try {
            const { filename } = req.params;
            const imageInfo = await this.mediaService.getImageInfo(filename);
            if (!imageInfo) {
                return res.status(404).json({ error: 'Không tìm thấy ảnh' });
            }
            res.json(imageInfo);
        }
        catch (error) {
            console.error('Get image info error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // Xóa ảnh
    async deleteImage(req, res) {
        try {
            const { filename } = req.params;
            const success = await this.mediaService.deleteImage(filename);
            if (!success) {
                return res.status(404).json({ error: 'Không tìm thấy ảnh để xóa' });
            }
            res.json({ message: 'Xóa ảnh thành công' });
        }
        catch (error) {
            console.error('Delete image error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // Lấy danh sách ảnh
    async listImages(req, res) {
        try {
            const images = await this.mediaService.listImages();
            res.json({
                message: 'Lấy danh sách ảnh thành công',
                images
            });
        }
        catch (error) {
            console.error('List images error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map