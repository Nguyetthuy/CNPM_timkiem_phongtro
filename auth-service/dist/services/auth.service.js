"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// ===============================
// auth-service/src/services/auth.service.ts
// ===============================
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret123'; // từ .env
class AuthService {
    static async register({ name, email, password }) {
        const existing = await user_model_1.default.findOne({ email });
        if (existing)
            throw new Error('Email đã tồn tại');
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_model_1.default.create({ name, email, password: hashedPassword });
        return { message: 'Đăng ký thành công', user: { id: user._id, email: user.email } };
    }
    static async login({ email, password }) {
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            throw new Error('Email không đúng');
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            throw new Error('Mật khẩu không đúng');
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return { message: 'Đăng nhập thành công', token, role: user.role };
    }
    static async getUserById(userId) {
        const user = await user_model_1.default.findById(userId).select('name email');
        if (!user)
            throw new Error('User không tồn tại');
        return { name: user.name, email: user.email };
    }
}
exports.AuthService = AuthService;
