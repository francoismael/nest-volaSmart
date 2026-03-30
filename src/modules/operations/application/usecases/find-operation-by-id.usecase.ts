import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepositoryToken } from '../ports/operations.repository.token';
import type { OperationsRepository } from '../ports/operations.repository.interface';
import { Operation } from '../../domain/entities/operation';

@Injectable()
export class FindOperationByIdUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Operation> {
    const operation = await this.operationsRepository.findById(id, userId);
    if (!operation) throw new NotFoundException('Opération non trouvée');
    return operation;
  }
}
