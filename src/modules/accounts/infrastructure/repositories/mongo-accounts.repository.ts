import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsRepository } from '../../application/ports/accounts.repository.interface';
import { AccountDocument } from '../schema/account.schema';
import { Account, AccountType } from '../../domain/entities/account';

@Injectable()
export class MongoAccountsRepository implements AccountsRepository {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<AccountDocument>,
  ) {}

  private toEntity(doc: AccountDocument): Account {
    return new Account(
      doc.id.toString(),
      doc.name,
      doc.type as AccountType,
      doc.userId,
      doc.description,
    );
  }

  async create(account: Account): Promise<Account> {
    const created = new this.accountModel({
      name: account.name,
      type: account.type,
      userId: account.userId,
      description: account.description,
    });
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findAll(userId: string): Promise<Account[]> {
    const docs = await this.accountModel.find({ userId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    const doc = await this.accountModel.findOne({ _id: id, userId }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(account: Account): Promise<Account> {
    const updated = await this.accountModel
      .findByIdAndUpdate(
        account.id,
        { name: account.name, type: account.type, description: account.description },
        { new: true },
      )
      .exec();
    if (!updated) throw new Error('Compte non trouvé');
    return this.toEntity(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.accountModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}
