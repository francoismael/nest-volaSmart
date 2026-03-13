import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../ports/operations.repository.token';
import type { OperationsRepository } from '../ports/operations.repository.interface';
import { Operation } from '../../domain/entities/operation';

@Injectable()
export class CreateOperationUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(
    date: Date,
    label: string,
    debit: number,
    credit: number,
    accountId: string,
    userId: string,
    notes?: string,
  ): Promise<Operation> {
    const operation = new Operation(
      '',
      date,
      label,
      debit ?? 0,
      credit ?? 0,
      accountId,
      userId,
      notes,
      userId,
    );
    return this.operationsRepository.create(operation);
  }
}
