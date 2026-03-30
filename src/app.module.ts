import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { OperationsModule } from './modules/operations/operations.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ExportModule } from './modules/export/export.module';
import { RecurringModule } from './modules/recurring/recurring.module';
import { BudgetModule } from './modules/budget/budget.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    MongooseModule.forRoot('mongodb://localhost:27017/volaSmart'),
    AuthenticationModule,
    AccountsModule,
    OperationsModule,
    LedgerModule,
    DashboardModule,
    ExportModule,
    RecurringModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
