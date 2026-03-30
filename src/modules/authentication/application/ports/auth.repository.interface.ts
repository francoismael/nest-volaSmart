import { User } from '../../domain/entities/user';

export interface AuthRepository {
  register(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
}
