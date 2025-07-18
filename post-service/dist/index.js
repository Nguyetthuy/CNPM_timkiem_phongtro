"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/posts', post_routes_1.default);
mongoose_1.default
    .connect('mongodb://mongo:27017/posts')
    .then(() => {
    app.listen(3002, () => console.log('Post-service running on port 3002'));
})
    .catch(err => console.error(err));
