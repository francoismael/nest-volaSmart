import { Inject, Injectable } from '@nestjs/common';
import type { IBudgetRepository } from '../ports/budget.repository.interface';
import { BudgetRepositoryToken } from '../ports/budget.repository.token';

@Injectable()
export class DeleteBudgetUsecase {
  constructor(
    @Inject(BudgetRepositoryToken)
    private readonly repo: IBudgetRepository,
  ) {}

  execute(userId: string, month: string, category: string): Promise<void> {
    return this.repo.delete(userId, month, category);
  }
}
