import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';

export interface DashboardResult {
  totalMoney: number;
  totalExpenses: number;
  currentBalance: number;
  recentOperations: any[];
}

@Injectable()
export class GetDashboardUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<DashboardResult> {
    const allOperations = await this.operationsRepository.findAll(userId);
    const totalMoney = allOperations.reduce((sum, op) => sum + (op.credit ?? 0), 0);
    const totalExpenses = allOperations.reduce((sum, op) => sum + (op.debit ?? 0), 0);
    const currentBalance = totalMoney - totalExpenses;
    const recentOperations = allOperations.slice(0, 10);

    return { totalMoney, totalExpenses, currentBalance, recentOperations };
  }
}
