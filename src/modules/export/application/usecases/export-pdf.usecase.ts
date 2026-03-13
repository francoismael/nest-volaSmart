import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

@Injectable()
export class ExportPdfUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<Buffer> {
    const operations = await this.operationsRepository.findAllForExport(userId);
    const totalDebit = operations.reduce((sum, op) => sum + (op.debit ?? 0), 0);
    const totalCredit = operations.reduce((sum, op) => sum + (op.credit ?? 0), 0);
    const balance = totalCredit - totalDebit;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('VolaSmart - Livre Comptable', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`);
      doc.moveDown();

      doc.fontSize(12).text('Date        Libellé                          Débit       Crédit');
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.3);

      for (const op of operations) {
        const date = op.date ? new Date(op.date).toLocaleDateString('fr-FR') : '';
        const label = (op.label ?? '').substring(0, 30).padEnd(30);
        const debit = (op.debit ?? 0).toFixed(2).padStart(10);
        const credit = (op.credit ?? 0).toFixed(2).padStart(10);
        doc.fontSize(9).text(`${date.padEnd(12)}${label}  ${debit}  ${credit}`);
      }

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(11).text(`Total Débit: ${totalDebit.toFixed(2)}`);
      doc.text(`Total Crédit: ${totalCredit.toFixed(2)}`);
      doc.text(`Solde: ${balance.toFixed(2)}`);

      doc.end();
    });
  }
}
