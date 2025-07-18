"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("../controllers/post.controller");
const router = express_1.default.Router();
router.post('/', post_controller_1.PostController.create);
router.get('/', post_controller_1.PostController.getAll);
router.get('/:id', post_controller_1.PostController.getOne);
exports.default = router;
