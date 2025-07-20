"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ===============================
// user-service/src/routes/user.routes.ts
// ===============================
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Tất cả routes đều cần authentication
router.use(auth_middleware_1.authMiddleware);
// Dashboard - lấy tất cả thông tin user
router.get('/dashboard', user_controller_1.UserController.getDashboard);
// Profile
router.get('/profile', user_controller_1.UserController.getProfile);
// Posts
router.get('/posts/approved', user_controller_1.UserController.getApprovedPosts);
router.get('/posts/pending', user_controller_1.UserController.getPendingPosts);
router.get('/posts', user_controller_1.UserController.getAllPosts);
// Stats
router.get('/stats', user_controller_1.UserController.getStats);
exports.default = router;
