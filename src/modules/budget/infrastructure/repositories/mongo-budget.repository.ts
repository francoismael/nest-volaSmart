import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBudgetRepository } from '../../application/ports/budget.repository.interface';
import { Budget } from '../../domain/entities/budget';

@Injectable()
export class MongoBudgetRepository implements IBudgetRepository {
  constructor(@InjectModel('Budget') private readonly model: Model<any>) {}

  private toEntity(doc: any): Budget {
    return new Budget(
      doc._id.toString(),
      doc.userId,
      doc.month,
      doc.category,
      doc.amount,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findByUserAndMonth(userId: string, month: string): Promise<Budget[]> {
    const docs = await this.model.find({ userId, month }).exec();
    return docs.map((d) => this.toEntity(d));
  }

  async findOne(userId: string, month: string, category: string): Promise<Budget | null> {
    const doc = await this.model.findOne({ userId, month, category }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async upsert(userId: string, month: string, category: string, amount: number): Promise<Budget> {
    const doc = await this.model.findOneAndUpdate(
      { userId, month, category },
      { $set: { amount } },
      { upsert: true, new: true },
    ).exec();
    if (!doc) throw new Error('Budget upsert failed');
    return this.toEntity(doc);
  }

  async delete(userId: string, month: string, category: string): Promise<void> {
    await this.model.deleteOne({ userId, month, category }).exec();
  }
}
