import { Schema, Document } from 'mongoose';

export const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    initialBalance: { type: Number, default: 0 },
  },
  { collection: 'users', timestamps: true },
);

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  initialBalance: number;
}
