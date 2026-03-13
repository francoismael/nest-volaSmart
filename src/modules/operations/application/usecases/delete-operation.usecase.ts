import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepositoryToken } from '../ports/operations.repository.token';
import type { OperationsRepository } from '../ports/operations.repository.interface';

@Injectable()
export class DeleteOperationUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ message: string }> {
    const operation = await this.operationsRepository.findById(id, userId);
    if (!operation) throw new NotFoundException('Opération non trouvée');
    await this.operationsRepository.delete(id, userId);
    return { message: 'Opération supprimée avec succès' };
  }
}
