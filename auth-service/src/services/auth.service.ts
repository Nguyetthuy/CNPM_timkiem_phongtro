// ===============================
// auth-service/src/services/auth.service.ts
// ===============================
import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123'; // từ .env

export class AuthService {
  static async register({ name, email, password }: { name: string; email: string; password: string }) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return { message: 'Đăng ký thành công', user: { id: user._id, email: user.email } };
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email không đúng');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Mật khẩu không đúng');

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return { message: 'Đăng nhập thành công', token, role: user.role };
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select('name email');
    if (!user) throw new Error('User không tồn tại');
    return { name: user.name, email: user.email };
  }
}
