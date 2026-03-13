import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { OperationsModule } from './modules/operations/operations.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/volaSmart'),
    AuthenticationModule,
    AccountsModule,
    OperationsModule,
    LedgerModule,
    DashboardModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
