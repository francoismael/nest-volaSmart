import { Module } from '@nestjs/common';
import { ExportController } from './interfaces/export.controller';
import { ExportCsvUsecase } from './application/usecases/export-csv.usecase';
import { ExportPdfUsecase } from './application/usecases/export-pdf.usecase';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OperationsModule } from '../operations/operations.module';

@Module({
  imports: [AuthenticationModule, OperationsModule],
  controllers: [ExportController],
  providers: [ExportCsvUsecase, ExportPdfUsecase],
})
export class ExportModule {}
