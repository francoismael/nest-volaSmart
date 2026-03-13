import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './interfaces/accounts.controller';
import { MongoAccountsRepository } from './infrastructure/repositories/mongo-accounts.repository';
import { AccountsRepositoryToken } from './application/ports/accounts.repository.token';
import { CreateAccountUsecase } from './application/usecases/create-account.usecase';
import { FindAllAccountsUsecase } from './application/usecases/find-all-accounts.usecase';
import { UpdateAccountUsecase } from './application/usecases/update-account.usecase';
import { DeleteAccountUsecase } from './application/usecases/delete-account.usecase';
import { AccountSchema } from './infrastructure/schema/account.schema';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    AuthenticationModule,
  ],
  controllers: [AccountsController],
  providers: [
    { provide: AccountsRepositoryToken, useClass: MongoAccountsRepository },
    CreateAccountUsecase,
    FindAllAccountsUsecase,
    UpdateAccountUsecase,
    DeleteAccountUsecase,
  ],
})
export class AccountsModule {}
