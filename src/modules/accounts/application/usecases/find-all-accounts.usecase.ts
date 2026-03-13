import { Inject, Injectable } from '@nestjs/common';
import { AccountsRepositoryToken } from '../ports/accounts.repository.token';
import type { AccountsRepository } from '../ports/accounts.repository.interface';
import { Account } from '../../domain/entities/account';

@Injectable()
export class FindAllAccountsUsecase {
  constructor(
    @Inject(AccountsRepositoryToken)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAll(userId);
  }
}
