import express from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate, requireAdmin } from '../middleware';

const router = express.Router();

router.post('/', PostController.create);
router.get('/', PostController.getAll);
router.get('/pending', authenticate, requireAdmin, PostController.getPending); // Lấy bài chưa duyệt
router.patch('/approve/:id', authenticate, requireAdmin, PostController.approve); // Duyệt bài
router.get('/:id', PostController.getOne);

export default router;
