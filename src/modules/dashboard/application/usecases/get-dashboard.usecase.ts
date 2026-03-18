import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';
import { AuthRepositoryToken } from '../../../authentication/application/ports/auth.repository.token';
import type { AuthRepository } from '../../../authentication/application/ports/auth.repository.interface';
import { Operation } from '../../../operations/domain/entities/operation';

export interface DashboardResult {
  initialBalance: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  todayDebit: number;
  todayCredit: number;
  weekDebit: number;
  weekCredit: number;
  monthDebit: number;
  monthCredit: number;
  yearDebit: number;
  yearCredit: number;
  recentOperations: any[];
}

function startOf(unit: 'day' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  if (unit === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (unit === 'week') {
    const day = now.getDay(); // 0=Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (unit === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

function sumPeriod(ops: Operation[], unit: 'day' | 'week' | 'month' | 'year') {
  const from = startOf(unit);
  const filtered = ops.filter((op) => new Date(op.date) >= from);
  return {
    debit: filtered.reduce((s, op) => s + (op.debit ?? 0), 0),
    credit: filtered.reduce((s, op) => s + (op.credit ?? 0), 0),
  };
}

@Injectable()
export class GetDashboardUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
    @Inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(userId: string): Promise<DashboardResult> {
    const [allOperations, user] = await Promise.all([
      this.operationsRepository.findAll(userId),
      this.authRepository.findById(userId),
    ]);

    const initialBalance = user?.initialBalance ?? 0;
    const totalCredit = allOperations.reduce((s, op) => s + (op.credit ?? 0), 0);
    const totalDebit = allOperations.reduce((s, op) => s + (op.debit ?? 0), 0);
    const currentBalance = initialBalance + totalCredit - totalDebit;

    const today = sumPeriod(allOperations, 'day');
    const week = sumPeriod(allOperations, 'week');
    const month = sumPeriod(allOperations, 'month');
    const year = sumPeriod(allOperations, 'year');

    const recentOperations = allOperations.slice(0, 10);

    return {
      initialBalance,
      totalCredit,
      totalDebit,
      currentBalance,
      todayDebit: today.debit,
      todayCredit: today.credit,
      weekDebit: week.debit,
      weekCredit: week.credit,
      monthDebit: month.debit,
      monthCredit: month.credit,
      yearDebit: year.debit,
      yearCredit: year.credit,
      recentOperations,
    };
  }
}
