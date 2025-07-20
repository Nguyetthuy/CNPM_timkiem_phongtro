// ===============================
// auth-service/src/routes/auth.routes.ts
// ===============================
import express from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/user/:id', AuthController.getUserById);
export default router;
