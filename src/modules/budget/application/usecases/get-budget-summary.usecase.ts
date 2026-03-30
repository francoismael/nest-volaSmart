import { Inject, Injectable } from '@nestjs/common';
import type { IBudgetRepository } from '../ports/budget.repository.interface';
import { BudgetRepositoryToken } from '../ports/budget.repository.token';
import type { OperationsRepository, OperationsFilter } from '../../../operations/application/ports/operations.repository.interface';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';

export interface BudgetSummaryItem {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  pct: number;
}

@Injectable()
export class GetBudgetSummaryUsecase {
  constructor(
    @Inject(BudgetRepositoryToken)
    private readonly budgetRepo: IBudgetRepository,
    @Inject(OperationsRepositoryToken)
    private readonly opsRepo: OperationsRepository,
  ) {}

  async execute(userId: string, month: string): Promise<BudgetSummaryItem[]> {
    // Parse month to get date range (YYYY-MM)
    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, m - 1, 1));
    const endDate = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999)); // last day of month

    const [budgets, operations] = await Promise.all([
      this.budgetRepo.findByUserAndMonth(userId, month),
      this.opsRepo.findAll(userId, { startDate, endDate } as OperationsFilter),
    ]);

    // Sum spending per category from operations
    const spentMap = new Map<string, number>();
    for (const op of operations) {
      if (op.debit && op.debit > 0) {
        const key = op.category ?? 'autres';
        spentMap.set(key, (spentMap.get(key) ?? 0) + op.debit);
      }
    }

    return budgets.map((b) => {
      const spent = spentMap.get(b.category) ?? 0;
      const remaining = b.amount - spent;
      const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      return { category: b.category, budgeted: b.amount, spent, remaining, pct };
    });
  }
}
