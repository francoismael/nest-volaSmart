import { Inject, Injectable } from '@nestjs/common';
import { AccountsRepositoryToken } from '../ports/accounts.repository.token';
import type { AccountsRepository } from '../ports/accounts.repository.interface';
import { Account, AccountType } from '../../domain/entities/account';

@Injectable()
export class CreateAccountUsecase {
  constructor(
    @Inject(AccountsRepositoryToken)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(
    name: string,
    type: AccountType,
    userId: string,
    description?: string,
  ): Promise<Account> {
    const account = new Account('', name, type, userId, description);
    return this.accountsRepository.create(account);
  }
}
