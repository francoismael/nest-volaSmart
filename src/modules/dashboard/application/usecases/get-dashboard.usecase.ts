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

function startOfUTC(unit: 'day' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  const y = now.getUTCFullYear(), m = now.getUTCMonth(), d = now.getUTCDate();
  if (unit === 'day') return new Date(Date.UTC(y, m, d));
  if (unit === 'week') {
    const dow = now.getUTCDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    return new Date(Date.UTC(y, m, d + diff));
  }
  if (unit === 'month') return new Date(Date.UTC(y, m, 1));
  return new Date(Date.UTC(y, 0, 1));
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

    const todayStart  = startOfUTC('day');
    const weekStart   = startOfUTC('week');
    const monthStart  = startOfUTC('month');
    const yearStart   = startOfUTC('year');

    const acc = allOperations.reduce(
      (s, op) => {
        const d   = op.debit  ?? 0;
        const c   = op.credit ?? 0;
        const dt  = new Date(op.date);
        s.totalDebit  += d;
        s.totalCredit += c;
        if (dt >= todayStart) { s.todayDebit  += d; s.todayCredit  += c; }
        if (dt >= weekStart)  { s.weekDebit   += d; s.weekCredit   += c; }
        if (dt >= monthStart) { s.monthDebit  += d; s.monthCredit  += c; }
        if (dt >= yearStart)  { s.yearDebit   += d; s.yearCredit   += c; }
        return s;
      },
      { totalDebit: 0, totalCredit: 0,
        todayDebit: 0, todayCredit: 0,
        weekDebit: 0,  weekCredit: 0,
        monthDebit: 0, monthCredit: 0,
        yearDebit: 0,  yearCredit: 0 },
    );

    const currentBalance = initialBalance + acc.totalCredit - acc.totalDebit;
    const recentOperations = allOperations.slice(0, 10);

    return {
      initialBalance,
      totalCredit:  acc.totalCredit,
      totalDebit:   acc.totalDebit,
      currentBalance,
      todayDebit:   acc.todayDebit,
      todayCredit:  acc.todayCredit,
      weekDebit:    acc.weekDebit,
      weekCredit:   acc.weekCredit,
      monthDebit:   acc.monthDebit,
      monthCredit:  acc.monthCredit,
      yearDebit:    acc.yearDebit,
      yearCredit:   acc.yearCredit,
      recentOperations,
    };
  }
}
