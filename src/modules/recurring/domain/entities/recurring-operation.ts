export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurringType = 'debit' | 'credit';

export class RecurringOperation {
  constructor(
    public readonly id: string,
    public label: string,
    public amount: number,
    public type: RecurringType,
    public frequency: RecurringFrequency,
    public dayOfMonth: number,
    public isActive: boolean,
    public userId: string,
    public notes?: string,
    public nextDate?: Date,
    public lastExecutedDate?: Date,
    public daysOfWeek?: number[],
  ) {}
}
