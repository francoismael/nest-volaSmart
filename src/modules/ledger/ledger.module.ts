import { Module } from '@nestjs/common';
import { LedgerController } from './interfaces/ledger.controller';
import { GetLedgerUsecase } from './application/usecases/get-ledger.usecase';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OperationsModule } from '../operations/operations.module';

@Module({
  imports: [AuthenticationModule, OperationsModule],
  controllers: [LedgerController],
  providers: [GetLedgerUsecase],
})
export class LedgerModule {}
