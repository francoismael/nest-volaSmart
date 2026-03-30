import { Schema } from 'mongoose';

export const BudgetSchema = new Schema(
  {
    userId:   { type: String, required: true },
    month:    { type: String, required: true }, // YYYY-MM
    category: { type: String, required: true },
    amount:   { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

BudgetSchema.index({ userId: 1, month: 1 });
BudgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });
