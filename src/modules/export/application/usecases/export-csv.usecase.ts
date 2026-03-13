import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';

@Injectable()
export class ExportCsvUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<string> {
    const operations = await this.operationsRepository.findAllForExport(userId);

    const headers = ['Date', 'Libellé', 'Débit', 'Crédit', 'Compte', 'Notes'];
    const rows = operations.map((op) => [
      op.date ? new Date(op.date).toISOString().split('T')[0] : '',
      `"${(op.label ?? '').replace(/"/g, '""')}"`,
      op.debit ?? 0,
      op.credit ?? 0,
      op.accountId ?? '',
      `"${(op.notes ?? '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csv;
  }
}
