import { Inject, Injectable } from '@nestjs/common';
import type { IBudgetRepository } from '../ports/budget.repository.interface';
import { BudgetRepositoryToken } from '../ports/budget.repository.token';
import { Budget } from '../../domain/entities/budget';

@Injectable()
export class UpsertBudgetUsecase {
  constructor(
    @Inject(BudgetRepositoryToken)
    private readonly repo: IBudgetRepository,
  ) {}

  execute(userId: string, month: string, category: string, amount: number): Promise<Budget> {
    return this.repo.upsert(userId, month, category, amount);
  }
}
