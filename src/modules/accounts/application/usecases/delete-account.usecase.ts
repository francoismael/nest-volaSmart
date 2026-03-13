import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepositoryToken } from '../ports/accounts.repository.token';
import type { AccountsRepository } from '../ports/accounts.repository.interface';

@Injectable()
export class DeleteAccountUsecase {
  constructor(
    @Inject(AccountsRepositoryToken)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ message: string }> {
    const account = await this.accountsRepository.findById(id, userId);
    if (!account) throw new NotFoundException('Compte non trouvé');
    await this.accountsRepository.delete(id, userId);
    return { message: 'Compte supprimé avec succès' };
  }
}
