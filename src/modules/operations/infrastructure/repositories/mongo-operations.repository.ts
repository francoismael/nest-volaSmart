import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { OperationsRepository, OperationsFilter } from '../../application/ports/operations.repository.interface';
import { OperationDocument } from '../schema/operation.schema';
import { Operation } from '../../domain/entities/operation';

@Injectable()
export class MongoOperationsRepository implements OperationsRepository {
  constructor(
    @InjectModel('Operation') private readonly operationModel: Model<OperationDocument>,
  ) {}

  private toEntity(doc: OperationDocument): Operation {
    return new Operation(
      doc.id.toString(),
      doc.date,
      doc.label,
      doc.debit,
      doc.credit,
      doc.accountId,
      doc.userId,
      doc.notes,
      doc.createdBy,
      doc.updatedBy,
    );
  }

  async create(operation: Operation): Promise<Operation> {
    const created = new this.operationModel({
      date: operation.date,
      label: operation.label,
      debit: operation.debit,
      credit: operation.credit,
      accountId: operation.accountId,
      userId: operation.userId,
      notes: operation.notes,
      createdBy: operation.createdBy,
    });
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findAll(userId: string, filter?: OperationsFilter): Promise<Operation[]> {
    const query: FilterQuery<OperationDocument> = { userId };

    if (filter?.accountId) query.accountId = filter.accountId;
    if (filter?.startDate || filter?.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = filter.startDate;
      if (filter.endDate) query.date.$lte = filter.endDate;
    }

    const docs = await this.operationModel.find(query).sort({ date: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string, userId: string): Promise<Operation | null> {
    const doc = await this.operationModel.findOne({ _id: id, userId }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(operation: Operation): Promise<Operation> {
    const updated = await this.operationModel
      .findByIdAndUpdate(
        operation.id,
        {
          date: operation.date,
          label: operation.label,
          debit: operation.debit,
          credit: operation.credit,
          accountId: operation.accountId,
          notes: operation.notes,
          updatedBy: operation.updatedBy,
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new Error('Opération non trouvée');
    return this.toEntity(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.operationModel.findOneAndDelete({ _id: id, userId }).exec();
  }

  async findAllForExport(userId: string): Promise<Operation[]> {
    const docs = await this.operationModel.find({ userId }).sort({ date: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }
}
