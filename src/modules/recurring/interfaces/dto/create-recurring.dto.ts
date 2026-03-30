export class CreateRecurringDto {
  label: string;
  amount: number;
  type: 'debit' | 'credit';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  daysOfWeek?: number[];  // sélection multiple: [1,2,3,4,5] = lun-ven
  notes?: string;
  isActive?: boolean;
}
