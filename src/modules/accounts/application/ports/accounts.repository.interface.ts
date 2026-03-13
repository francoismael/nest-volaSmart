import { Account } from '../../domain/entities/account';

export interface AccountsRepository {
  create(account: Account): Promise<Account>;
  findAll(userId: string): Promise<Account[]>;
  findById(id: string, userId: string): Promise<Account | null>;
  update(account: Account): Promise<Account>;
  delete(id: string, userId: string): Promise<void>;
}
