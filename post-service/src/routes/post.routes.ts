import express from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate, requireAdmin } from '../middleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/images'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'images-' + uniqueSuffix + '-' + file.originalname);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi ảnh
});

router.post('/', authenticate, upload.array('images', 5), PostController.create);
router.get('/', PostController.getAll);
router.get('/pending', authenticate, requireAdmin, PostController.getPending); // Lấy bài chưa duyệt
router.patch('/approve/:id', authenticate, requireAdmin, PostController.approve); // Duyệt bài
router.patch('/:id', authenticate, PostController.update); // Update post (không yêu cầu admin)
router.delete('/:id', authenticate, PostController.delete); // Xóa bài đăng
router.get('/approved', PostController.getApproved);
router.get('/search', PostController.search);
router.post('/:id/rate', PostController.ratePost);

// Route để serve ảnh - phải đặt trước /:id để tránh conflict
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../../uploads/images', filename);
  console.log('Serving image:', filename, 'from path:', imagePath);
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

router.get('/:id', PostController.getOne);

export default router;
