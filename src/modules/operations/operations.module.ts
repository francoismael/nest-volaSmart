import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperationsController } from './interfaces/operations.controller';
import { MongoOperationsRepository } from './infrastructure/repositories/mongo-operations.repository';
import { OperationsRepositoryToken } from './application/ports/operations.repository.token';
import { CreateOperationUsecase } from './application/usecases/create-operation.usecase';
import { FindAllOperationsUsecase } from './application/usecases/find-all-operations.usecase';
import { FindOperationByIdUsecase } from './application/usecases/find-operation-by-id.usecase';
import { UpdateOperationUsecase } from './application/usecases/update-operation.usecase';
import { DeleteOperationUsecase } from './application/usecases/delete-operation.usecase';
import { OperationSchema } from './infrastructure/schema/operation.schema';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Operation', schema: OperationSchema }]),
    AuthenticationModule,
  ],
  controllers: [OperationsController],
  providers: [
    { provide: OperationsRepositoryToken, useClass: MongoOperationsRepository },
    CreateOperationUsecase,
    FindAllOperationsUsecase,
    FindOperationByIdUsecase,
    UpdateOperationUsecase,
    DeleteOperationUsecase,
  ],
  exports: [{ provide: OperationsRepositoryToken, useClass: MongoOperationsRepository }],
})
export class OperationsModule {}
