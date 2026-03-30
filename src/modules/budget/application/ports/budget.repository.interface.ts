import { Budget } from '../../domain/entities/budget';

export interface IBudgetRepository {
  findByUserAndMonth(userId: string, month: string): Promise<Budget[]>;
  findOne(userId: string, month: string, category: string): Promise<Budget | null>;
  upsert(userId: string, month: string, category: string, amount: number): Promise<Budget>;
  delete(userId: string, month: string, category: string): Promise<void>;
}
