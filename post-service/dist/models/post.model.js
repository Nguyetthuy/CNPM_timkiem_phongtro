"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    title: String,
    content: String,
    author: String,
    authorId: String, // Thêm trường authorId để lưu userId
    status: { type: String, default: 'pending' }, // Thêm trường status
    images: [{ type: String }], // Thêm trường images để lưu URL ảnh
});
exports.default = mongoose_1.default.model('Post', postSchema);
