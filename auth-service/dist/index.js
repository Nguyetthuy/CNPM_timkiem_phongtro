"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ===============================
// auth-service/src/index.ts
// ===============================
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("./models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});
app.use('/', auth_routes_1.default);
mongoose_1.default.connect('mongodb://mongo:27017/findhouse').then(async () => {
    console.log('Connected to MongoDB');
    try {
        // Tạo admin mặc định nếu chưa có
        const admin = await user_model_1.default.findOne({ email: 'admin@gmail.com' });
        console.log('Admin user check:', admin ? 'Found' : 'Not found');
        const hashed = await bcryptjs_1.default.hash('12345', 10);
        if (!admin) {
            const newAdmin = await user_model_1.default.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashed,
                role: 'admin'
            });
            console.log('✅ Tạo tài khoản admin mặc định thành công:', newAdmin.email);
        }
        else {
            let needUpdate = false;
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                needUpdate = true;
                console.log('🔄 Cập nhật role admin');
            }
            // So sánh password đã hash
            const bcryptCompare = await bcryptjs_1.default.compare('12345', admin.password);
            if (!bcryptCompare) {
                admin.password = hashed;
                needUpdate = true;
                console.log('🔄 Cập nhật password admin');
            }
            if (needUpdate) {
                await admin.save();
                console.log('✅ Cập nhật tài khoản admin thành công: admin@gmail.com/12345');
            }
            else {
                console.log('✅ Tài khoản admin đã tồn tại và đúng: admin@gmail.com/12345');
            }
        }
    }
    catch (error) {
        console.error('❌ Lỗi khi tạo/cập nhật admin user:', error);
    }
    app.listen(3001, () => console.log('Auth service on port 3001'));
}).catch(error => {
    console.error('❌ Lỗi kết nối MongoDB:', error);
});
