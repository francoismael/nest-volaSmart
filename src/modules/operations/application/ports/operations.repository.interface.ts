import { Operation } from '../../domain/entities/operation';

export interface OperationsFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface OperationsRepository {
  create(operation: Operation): Promise<Operation>;
  findAll(userId: string, filter?: OperationsFilter): Promise<Operation[]>;
  findById(id: string, userId: string): Promise<Operation | null>;
  update(operation: Operation): Promise<Operation>;
  delete(id: string, userId: string): Promise<void>;
  findAllForExport(userId: string): Promise<Operation[]>;
}
