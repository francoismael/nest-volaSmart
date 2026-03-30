import { Schema, Document } from 'mongoose';

export interface RecurringOperationDocument extends Document {
  label: string;
  amount: number;
  type: 'debit' | 'credit';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth: number;
  daysOfWeek: number[]; // [1,2,3,4,5] = lun-ven, [0,6] = week-end
  isActive: boolean;
  userId: string;
  notes?: string;
  nextDate: Date;
  lastExecutedDate?: Date;
}

export const RecurringOperationSchema = new Schema<RecurringOperationDocument>(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' },
    dayOfMonth: { type: Number, default: 1 },
    daysOfWeek: { type: [Number], default: [1] },
    isActive: { type: Boolean, default: true },
    userId: { type: String, required: true },
    notes: { type: String },
    nextDate: { type: Date, required: true },
    lastExecutedDate: { type: Date },
  },
  { collection: 'recurring_operations', timestamps: true },
);
