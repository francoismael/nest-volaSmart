import { Schema, Document } from 'mongoose';

export interface OperationDocument extends Document {
  date: Date;
  label: string;
  debit: number;
  credit: number;
  accountId: string;
  userId: string;
  category?: string;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const OperationSchema = new Schema<OperationDocument>(
  {
    date: { type: Date, required: true },
    label: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    accountId: { type: String },
    userId: { type: String, required: true },
    category: { type: String, default: 'autres' },
    notes: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { collection: 'operations', timestamps: true },
);

OperationSchema.index({ userId: 1, date: -1 });
OperationSchema.index({ userId: 1 });
