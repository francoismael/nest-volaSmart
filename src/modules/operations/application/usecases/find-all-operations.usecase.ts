import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../ports/operations.repository.token';
import type { OperationsRepository, OperationsFilter, PaginatedOperations } from '../ports/operations.repository.interface';
import { Operation } from '../../domain/entities/operation';

@Injectable()
export class FindAllOperationsUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string, filter?: OperationsFilter): Promise<Operation[]> {
    return this.operationsRepository.findAll(userId, filter);
  }

  async executePaginated(userId: string, filter?: OperationsFilter): Promise<PaginatedOperations> {
    return this.operationsRepository.findAllPaginated(userId, filter);
  }
}
