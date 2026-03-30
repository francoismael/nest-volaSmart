import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { ExportCsvUsecase } from '../application/usecases/export-csv.usecase';
import { ExportPdfUsecase } from '../application/usecases/export-pdf.usecase';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportCsvUsecase: ExportCsvUsecase,
    private readonly exportPdfUsecase: ExportPdfUsecase,
  ) {}

  @Get('csv')
  async exportCsv(@Request() req: RequestWithUser, @Res() res: Response) {
    const csv = await this.exportCsvUsecase.execute(req.user.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="volasmart-operations.csv"');
    res.send('\uFEFF' + csv);
  }

  @Get('pdf')
  async exportPdf(@Request() req: RequestWithUser, @Res() res: Response) {
    const pdfBuffer = await this.exportPdfUsecase.execute(req.user.userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="volasmart-ledger.pdf"');
    res.send(pdfBuffer);
  }
}
