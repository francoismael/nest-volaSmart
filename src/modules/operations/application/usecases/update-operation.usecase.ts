import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepositoryToken } from '../ports/operations.repository.token';
import type { OperationsRepository } from '../ports/operations.repository.interface';
import { Operation } from '../../domain/entities/operation';

@Injectable()
export class UpdateOperationUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    date?: Date,
    label?: string,
    debit?: number,
    credit?: number,
    accountId?: string,
    notes?: string,
  ): Promise<Operation> {
    const operation = await this.operationsRepository.findById(id, userId);
    if (!operation) throw new NotFoundException('Opération non trouvée');

    if (date !== undefined) operation.date = date;
    if (label !== undefined) operation.label = label;
    if (debit !== undefined) operation.debit = debit;
    if (credit !== undefined) operation.credit = credit;
    if (accountId !== undefined) operation.accountId = accountId;
    if (notes !== undefined) operation.notes = notes;
    (operation as any).updatedBy = userId;

    return this.operationsRepository.update(operation);
  }
}
