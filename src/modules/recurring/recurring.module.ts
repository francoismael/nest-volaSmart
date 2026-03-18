import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecurringController } from './interfaces/recurring.controller';
import { MongoRecurringRepository } from './infrastructure/repositories/mongo-recurring.repository';
import { RecurringOperationSchema } from './infrastructure/schema/recurring-operation.schema';
import { RecurringSchedulerService } from './application/recurring-scheduler.service';
import { OperationSchema } from '../operations/infrastructure/schema/operation.schema';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RecurringOperation', schema: RecurringOperationSchema },
      { name: 'Operation', schema: OperationSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [RecurringController],
  providers: [MongoRecurringRepository, RecurringSchedulerService],
})
export class RecurringModule {}
