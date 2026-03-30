import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { OperationsRepository, OperationsFilter, PaginatedOperations } from '../../application/ports/operations.repository.interface';
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
      '',
      doc.userId,
      doc.notes,
      doc.createdBy,
      doc.updatedBy,
      doc.category,
    );
  }

  async create(operation: Operation): Promise<Operation> {
    const created = new this.operationModel({
      date: operation.date,
      label: operation.label,
      debit: operation.debit,
      credit: operation.credit,
      userId: operation.userId,
      category: operation.category ?? 'autres',
      notes: operation.notes,
      createdBy: operation.createdBy,
    });
    const saved = await created.save();
    return this.toEntity(saved);
  }

  private buildQuery(userId: string, filter?: OperationsFilter): FilterQuery<OperationDocument> {
    const query: FilterQuery<OperationDocument> = { userId };
    if (filter?.startDate || filter?.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = filter.startDate;
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    return query;
  }

  async findAll(userId: string, filter?: OperationsFilter): Promise<Operation[]> {
    const query = this.buildQuery(userId, filter);
    const docs = await this.operationModel.find(query).sort({ date: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findAllPaginated(userId: string, filter?: OperationsFilter): Promise<PaginatedOperations> {
    const query = this.buildQuery(userId, filter);
    const page  = Math.max(1, filter?.page  ?? 1);
    const limit = Math.min(200, Math.max(1, filter?.limit ?? 50));
    const skip  = (page - 1) * limit;

    const [docs, total, allForTotals] = await Promise.all([
      this.operationModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).exec(),
      this.operationModel.countDocuments(query).exec(),
      this.operationModel.aggregate([
        { $match: query },
        { $group: { _id: null, totalDebit: { $sum: '$debit' }, totalCredit: { $sum: '$credit' } } },
      ]).exec(),
    ]);

    const totals = allForTotals[0] ?? { totalDebit: 0, totalCredit: 0 };
    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalDebit: totals.totalDebit,
      totalCredit: totals.totalCredit,
    };
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
          category: operation.category,
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
