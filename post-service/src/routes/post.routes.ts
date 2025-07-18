import express from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate, requireAdmin } from '../middleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi ảnh
});

router.post('/', upload.array('images', 5), PostController.create);
router.get('/', PostController.getAll);
router.get('/pending', authenticate, requireAdmin, PostController.getPending); // Lấy bài chưa duyệt
router.patch('/approve/:id', authenticate, requireAdmin, PostController.approve); // Duyệt bài
router.get('/approved', PostController.getApproved);
router.get('/:id', PostController.getOne);

export default router;
