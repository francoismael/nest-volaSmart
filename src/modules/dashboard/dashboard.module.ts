import { Module } from '@nestjs/common';
import { DashboardController } from './interfaces/dashboard.controller';
import { GetDashboardUsecase } from './application/usecases/get-dashboard.usecase';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OperationsModule } from '../operations/operations.module';

@Module({
  imports: [AuthenticationModule, OperationsModule],
  controllers: [DashboardController],
  providers: [GetDashboardUsecase],
})
export class DashboardModule {}
