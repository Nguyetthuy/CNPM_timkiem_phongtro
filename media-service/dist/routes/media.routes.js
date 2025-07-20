"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const media_controller_1 = require("../controllers/media.controller");
const upload_middleware_1 = __importStar(require("../middleware/upload.middleware"));
const router = express_1.default.Router();
const mediaController = new media_controller_1.MediaController();
// Upload ảnh (có thể upload nhiều ảnh)
router.post('/upload', upload_middleware_1.validateMultipartRequest, upload_middleware_1.default.array('images', 10), mediaController.uploadImage.bind(mediaController));
// Lấy ảnh theo tên file
router.get('/images/:filename', mediaController.getImage.bind(mediaController));
// Lấy thông tin ảnh
router.get('/images/:filename/info', mediaController.getImageInfo.bind(mediaController));
// Xóa ảnh
router.delete('/images/:filename', mediaController.deleteImage.bind(mediaController));
// Lấy danh sách tất cả ảnh
router.get('/images', mediaController.listImages.bind(mediaController));
// Middleware xử lý lỗi upload
router.use(upload_middleware_1.handleUploadError);
exports.default = router;
//# sourceMappingURL=media.routes.js.map