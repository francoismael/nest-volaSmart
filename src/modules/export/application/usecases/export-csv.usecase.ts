import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';

function esc(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

@Injectable()
export class ExportCsvUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<string> {
    const operations = await this.operationsRepository.findAllForExport(userId);

    const totalDebit = operations.reduce((s, op) => s + (op.debit ?? 0), 0);
    const totalCredit = operations.reduce((s, op) => s + (op.credit ?? 0), 0);
    const balance = totalCredit - totalDebit;

    const sep = ';';
    const lines: string[] = [];

    // File header
    lines.push(`VolaSmart - Livre Comptable`);
    lines.push(`Exporté le ${sep}${new Date().toLocaleDateString('fr-FR')}`);
    lines.push('');

    // Column headers
    lines.push(['Date', 'Libellé', 'Débit (Ar)', 'Crédit (Ar)', 'Solde cumulé', 'Notes'].join(sep));

    // Rows with running balance
    let running = 0;
    for (const op of operations) {
      running += (op.credit ?? 0) - (op.debit ?? 0);
      const date = op.date ? new Date(op.date).toLocaleDateString('fr-FR') : '';
      lines.push([
        date,
        esc(op.label ?? ''),
        op.debit && op.debit > 0 ? fmt(op.debit) : '',
        op.credit && op.credit > 0 ? fmt(op.credit) : '',
        fmt(running),
        esc(op.notes ?? ''),
      ].join(sep));
    }

    // Totals
    lines.push('');
    lines.push(['TOTAL', '', fmt(totalDebit), fmt(totalCredit), fmt(balance), ''].join(sep));

    return '\uFEFF' + lines.join('\r\n'); // UTF-8 BOM for Excel
  }
}
