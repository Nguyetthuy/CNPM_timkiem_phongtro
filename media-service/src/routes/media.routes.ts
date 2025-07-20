import express from 'express';
import { MediaController } from '../controllers/media.controller';
import upload, { handleUploadError, validateMultipartRequest } from '../middleware/upload.middleware';

const router = express.Router();
const mediaController = new MediaController();

// Upload ảnh (có thể upload nhiều ảnh)
router.post('/upload', validateMultipartRequest, upload.array('images', 10), mediaController.uploadImage.bind(mediaController));

// Lấy ảnh theo tên file
router.get('/images/:filename', mediaController.getImage.bind(mediaController));

// Lấy thông tin ảnh
router.get('/images/:filename/info', mediaController.getImageInfo.bind(mediaController));

// Xóa ảnh
router.delete('/images/:filename', mediaController.deleteImage.bind(mediaController));

// Lấy danh sách tất cả ảnh
router.get('/images', mediaController.listImages.bind(mediaController));

// Middleware xử lý lỗi upload
router.use(handleUploadError);

export default router; 