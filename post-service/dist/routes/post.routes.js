"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("../controllers/post.controller");
const middleware_1 = require("../middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path_1.default.join(__dirname, '../../uploads'));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi ảnh
});
router.post('/', upload.array('images', 5), post_controller_1.PostController.create);
router.get('/', post_controller_1.PostController.getAll);
router.get('/pending', middleware_1.authenticate, middleware_1.requireAdmin, post_controller_1.PostController.getPending); // Lấy bài chưa duyệt
router.patch('/approve/:id', middleware_1.authenticate, middleware_1.requireAdmin, post_controller_1.PostController.approve); // Duyệt bài
router.get('/approved', post_controller_1.PostController.getApproved);
router.get('/:id', post_controller_1.PostController.getOne);
exports.default = router;
