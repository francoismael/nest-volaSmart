import { Operation } from '../../domain/entities/operation';

export interface OperationsFilter {
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedOperations {
  data: Operation[];
  total: number;
  page: number;
  totalPages: number;
  totalDebit: number;
  totalCredit: number;
}

export interface OperationsRepository {
  create(operation: Operation): Promise<Operation>;
  findAll(userId: string, filter?: OperationsFilter): Promise<Operation[]>;
  findAllPaginated(userId: string, filter?: OperationsFilter): Promise<PaginatedOperations>;
  findById(id: string, userId: string): Promise<Operation | null>;
  update(operation: Operation): Promise<Operation>;
  delete(id: string, userId: string): Promise<void>;
  findAllForExport(userId: string): Promise<Operation[]>;
}
