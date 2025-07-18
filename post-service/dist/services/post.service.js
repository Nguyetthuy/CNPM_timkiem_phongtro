"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
class PostService {
    static async createPost(data) {
        return await post_model_1.default.create(data);
    }
    static async getAllPosts() {
        return await post_model_1.default.find();
    }
    static async getPostById(id) {
        return await post_model_1.default.findById(id);
    }
}
exports.PostService = PostService;
