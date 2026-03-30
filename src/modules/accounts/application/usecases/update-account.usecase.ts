import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepositoryToken } from '../ports/accounts.repository.token';
import type { AccountsRepository } from '../ports/accounts.repository.interface';
import { Account, AccountType } from '../../domain/entities/account';

@Injectable()
export class UpdateAccountUsecase {
  constructor(
    @Inject(AccountsRepositoryToken)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    name?: string,
    type?: AccountType,
    description?: string,
  ): Promise<Account> {
    const account = await this.accountsRepository.findById(id, userId);
    if (!account) throw new NotFoundException('Compte non trouvé');

    if (name) account.name = name;
    if (type) account.type = type;
    if (description !== undefined) account.description = description;

    return this.accountsRepository.update(account);
  }
}
