import { Inject, Injectable } from '@nestjs/common';
import { OperationsRepositoryToken } from '../../../operations/application/ports/operations.repository.token';
import type { OperationsRepository } from '../../../operations/application/ports/operations.repository.interface';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

const MARGIN  = 40;
const ROW_H   = 22;
const HEAD_H  = 58;
const LB      = { lineBreak: false }; // empêche PDFKit d'ajouter des pages

const C = {
  date:    MARGIN,
  label:   108,
  notes:   258,
  debit:   353,
  credit:  428,
  balance: 470,
  end:     555,
};

function fmt(n: number): string {
  return Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

@Injectable()
export class ExportPdfUsecase {
  constructor(
    @Inject(OperationsRepositoryToken)
    private readonly operationsRepository: OperationsRepository,
  ) {}

  async execute(userId: string): Promise<Buffer> {
    const operations = await this.operationsRepository.findAllForExport(userId);
    const totalDebit  = operations.reduce((s, op) => s + (op.debit  ?? 0), 0);
    const totalCredit = operations.reduce((s, op) => s + (op.credit ?? 0), 0);
    const balance     = totalCredit - totalDebit;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end',  () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W       = doc.page.width;   // 595
      const H       = doc.page.height;  // 841.89
      const TABLE_W = W - MARGIN * 2;
      // Footer line position — safely above PDFKit's auto-page trigger (H - MARGIN = 801)
      const FOOT_Y  = H - 52;          // ~789 — well within safe zone
      // Last allowed row bottom — must be above footer with some gap
      const Y_MAX   = FOOT_Y - 14;     // ~775

      // ── Solde cumulé ──────────────────────────────────────────────
      const cumulArr: number[] = new Array(operations.length);
      for (let i = operations.length - 1; i >= 0; i--) {
        const prev = cumulArr[i + 1] ?? 0;
        cumulArr[i] = prev + (operations[i].credit ?? 0) - (operations[i].debit ?? 0);
      }

      // ── Header ────────────────────────────────────────────────────
      const drawPageHeader = () => {
        doc.rect(0, 0, W, HEAD_H).fill('#111827');
        doc.rect(0, HEAD_H, W, 3).fill('#2563EB');
        doc.fillColor('#2563EB').fontSize(22).font('Helvetica-Bold')
          .text('V', MARGIN, 15, LB);
        doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
          .text('olaSmart', MARGIN + 17, 17, LB);
        doc.fillColor('#6B7280').fontSize(8).font('Helvetica')
          .text('Livre Comptable', MARGIN, 43, LB);
        doc.fillColor('#9CA3AF').fontSize(8)
          .text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, MARGIN, 22, { align: 'right', width: TABLE_W, ...LB });
        doc.fillColor('#6B7280').fontSize(7.5)
          .text(`${operations.length} opération(s)`, MARGIN, 36, { align: 'right', width: TABLE_W, ...LB });
      };

      // ── En-tête tableau ──────────────────────────────────────────
      const drawTableHeader = (y: number): number => {
        doc.rect(MARGIN, y, TABLE_W, ROW_H).fill('#1E3A8A');
        doc.fillColor('white').fontSize(7.5).font('Helvetica-Bold');
        doc.text('DATE',    C.date,    y + 7, { width: C.label   - C.date   - 6, ...LB });
        doc.text('LIBELLÉ', C.label,   y + 7, { width: C.notes   - C.label  - 6, ...LB });
        doc.text('NOTES',   C.notes,   y + 7, { width: C.debit   - C.notes  - 6, ...LB });
        doc.text('DÉBIT',   C.debit,   y + 7, { width: C.credit  - C.debit  - 4, align: 'right', ...LB });
        doc.text('CRÉDIT',  C.credit,  y + 7, { width: C.balance - C.credit - 4, align: 'right', ...LB });
        doc.text('SOLDE',   C.balance, y + 7, { width: C.end     - C.balance - 4, align: 'right', ...LB });
        return y + ROW_H;
      };

      // ── Footer (simple ligne + texte) ─────────────────────────────
      const drawFooter = (pageNum: number) => {
        const fy = FOOT_Y;
        doc.moveTo(MARGIN, fy).lineTo(W - MARGIN, fy)
          .strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        doc.fillColor('#9CA3AF').fontSize(7).font('Helvetica')
          .text('VolaSmart', MARGIN, fy + 5, LB);
        doc.fillColor('#9CA3AF').fontSize(7)
          .text(`Page ${pageNum}`, MARGIN, fy + 5, { align: 'right', width: TABLE_W, ...LB });
      };

      // ── Page 1 ────────────────────────────────────────────────────
      drawPageHeader();
      let y = HEAD_H + 3 + 12;
      y = drawTableHeader(y);
      let pageNum  = 1;
      let rowIndex = 0;

      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];

        if (y + ROW_H > Y_MAX) {
          drawFooter(pageNum);
          doc.addPage();
          pageNum++;
          drawPageHeader();
          y = HEAD_H + 3 + 12;
          y = drawTableHeader(y);
          rowIndex = 0;
        }

        if (rowIndex % 2 !== 0) {
          doc.rect(MARGIN, y, TABLE_W, ROW_H).fill('#F8FAFC');
        }

        const dateStr  = op.date  ? new Date(op.date).toLocaleDateString('fr-FR') : '';
        const labelStr = (op.label  ?? '').substring(0, 24);
        const notesStr = (op.notes  ?? '').substring(0, 22);
        const debitV   = op.debit  && op.debit  > 0 ? fmt(op.debit)  : null;
        const creditV  = op.credit && op.credit > 0 ? fmt(op.credit) : null;
        const balV     = cumulArr[i] ?? 0;

        doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
          .text(dateStr,  C.date,  y + 7, { width: C.label - C.date  - 6, ...LB });
        doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold')
          .text(labelStr, C.label, y + 7, { width: C.notes - C.label - 6, ...LB });
        doc.fillColor('#9CA3AF').fontSize(7).font('Helvetica')
          .text(notesStr, C.notes, y + 7, { width: C.debit - C.notes - 6, ...LB });

        if (debitV) {
          doc.fillColor('#DC2626').font('Helvetica-Bold').fontSize(7.5)
            .text(debitV, C.debit, y + 7, { width: C.credit - C.debit - 4, align: 'right', ...LB });
        } else {
          doc.fillColor('#D1D5DB').font('Helvetica').fontSize(7.5)
            .text('—', C.debit, y + 7, { width: C.credit - C.debit - 4, align: 'right', ...LB });
        }

        if (creditV) {
          doc.fillColor('#16A34A').font('Helvetica-Bold').fontSize(7.5)
            .text(creditV, C.credit, y + 7, { width: C.balance - C.credit - 4, align: 'right', ...LB });
        } else {
          doc.fillColor('#D1D5DB').font('Helvetica').fontSize(7.5)
            .text('—', C.credit, y + 7, { width: C.balance - C.credit - 4, align: 'right', ...LB });
        }

        const balSign = balV < 0 ? '-' : '';
        doc.fillColor(balV >= 0 ? '#1D4ED8' : '#DC2626').font('Helvetica-Bold').fontSize(7.5)
          .text(`${balSign}${fmt(balV)}`, C.balance, y + 7, { width: C.end - C.balance - 4, align: 'right', ...LB });

        doc.moveTo(MARGIN, y + ROW_H).lineTo(W - MARGIN, y + ROW_H)
          .strokeColor('#F3F4F6').lineWidth(0.4).stroke();

        y += ROW_H;
        rowIndex++;
      }

      // ── TOTAUX ────────────────────────────────────────────────────
      if (y + 32 > Y_MAX) {
        drawFooter(pageNum);
        doc.addPage();
        pageNum++;
        drawPageHeader();
        y = HEAD_H + 3 + 12;
      }

      y += 6;
      doc.rect(MARGIN, y, TABLE_W, 26).fill('#1E3A8A');
      doc.fillColor('white').fontSize(8.5).font('Helvetica-Bold')
        .text('TOTAUX', C.date, y + 9, { width: C.debit - C.date - 6, ...LB });
      doc.fillColor('#FCA5A5').fontSize(8)
        .text(fmt(totalDebit),  C.debit,   y + 9, { width: C.credit  - C.debit   - 4, align: 'right', ...LB });
      doc.fillColor('#86EFAC')
        .text(fmt(totalCredit), C.credit,  y + 9, { width: C.balance - C.credit  - 4, align: 'right', ...LB });
      doc.fillColor(balance >= 0 ? '#93C5FD' : '#FCA5A5')
        .text(`${balance < 0 ? '-' : ''}${fmt(balance)}`, C.balance, y + 9, { width: C.end - C.balance - 4, align: 'right', ...LB });

      drawFooter(pageNum);
      doc.end();
    });
  }
}
