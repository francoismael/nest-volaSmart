import { Schema, Document } from 'mongoose';
import { AccountType } from '../../domain/entities/account';

export interface AccountDocument extends Document {
  name: string;
  type: AccountType;
  userId: string;
  description?: string;
}

export const AccountSchema = new Schema<AccountDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    userId: { type: String, required: true },
    description: { type: String },
  },
  { collection: 'accounts', timestamps: true },
);
