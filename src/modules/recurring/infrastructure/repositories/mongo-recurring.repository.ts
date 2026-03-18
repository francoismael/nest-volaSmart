import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecurringOperationDocument } from '../schema/recurring-operation.schema';
import { RecurringOperation } from '../../domain/entities/recurring-operation';

@Injectable()
export class MongoRecurringRepository {
  constructor(
    @InjectModel('RecurringOperation')
    private readonly model: Model<RecurringOperationDocument>,
  ) {}

  private toEntity(doc: RecurringOperationDocument): RecurringOperation {
    return new RecurringOperation(
      doc.id.toString(),
      doc.label,
      doc.amount,
      doc.type,
      doc.frequency,
      doc.dayOfMonth,
      doc.isActive,
      doc.userId,
      doc.notes,
      doc.nextDate,
      doc.lastExecutedDate,
      doc.daysOfWeek,
    );
  }

  async create(data: Omit<RecurringOperation, 'id'>): Promise<RecurringOperation> {
    const created = new this.model(data);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findAll(userId: string): Promise<RecurringOperation[]> {
    const docs = await this.model.find({ userId }).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string, userId: string): Promise<RecurringOperation | null> {
    const doc = await this.model.findOne({ _id: id, userId }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(id: string, userId: string, data: Partial<RecurringOperation>): Promise<RecurringOperation> {
    const updated = await this.model
      .findOneAndUpdate({ _id: id, userId }, data, { new: true })
      .exec();
    if (!updated) throw new Error('Dépense fixe non trouvée');
    return this.toEntity(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.model.findOneAndDelete({ _id: id, userId }).exec();
  }
}
