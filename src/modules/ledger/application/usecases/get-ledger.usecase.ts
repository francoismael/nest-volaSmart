import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';

export interface LedgerResult {
  operations: any[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

@Injectable()
export class GetLedgerUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<LedgerResult> {
    const operations = await this.operationsRepository.findAll(userId);
    const totalDebit = operations.reduce((sum, op) => sum + (op.debit ?? 0), 0);
    const totalCredit = operations.reduce(
      (sum, op) => sum + (op.credit ?? 0),
      0,
    );
    const balance = totalCredit - totalDebit;

    return { operations, totalDebit, totalCredit, balance };
  }
}
