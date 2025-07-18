import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string; // Thêm trường role
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }, // Thêm trường role, mặc định 'user'
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
