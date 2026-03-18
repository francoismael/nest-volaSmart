export class UpdateRecurringDto {
  label?: string;
  amount?: number;
  type?: 'debit' | 'credit';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  daysOfWeek?: number[];
  notes?: string;
  isActive?: boolean;
}
