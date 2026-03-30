import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetController } from './interfaces/budget.controller';
import { MongoBudgetRepository } from './infrastructure/repositories/mongo-budget.repository';
import { BudgetRepositoryToken } from './application/ports/budget.repository.token';
import { UpsertBudgetUsecase } from './application/usecases/upsert-budget.usecase';
import { DeleteBudgetUsecase } from './application/usecases/delete-budget.usecase';
import { GetBudgetSummaryUsecase } from './application/usecases/get-budget-summary.usecase';
import { BudgetSchema } from './infrastructure/schema/budget.schema';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OperationsModule } from '../operations/operations.module';
import { OperationsRepositoryToken } from '../operations/application/ports/operations.repository.token';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Budget', schema: BudgetSchema }]),
    AuthenticationModule,
    OperationsModule,
  ],
  controllers: [BudgetController],
  providers: [
    { provide: BudgetRepositoryToken, useClass: MongoBudgetRepository },
    UpsertBudgetUsecase,
    DeleteBudgetUsecase,
    {
      provide: GetBudgetSummaryUsecase,
      useFactory: (budgetRepo: any, opsRepo: any) =>
        new GetBudgetSummaryUsecase(budgetRepo, opsRepo),
      inject: [BudgetRepositoryToken, OperationsRepositoryToken],
    },
  ],
})
export class BudgetModule {}
