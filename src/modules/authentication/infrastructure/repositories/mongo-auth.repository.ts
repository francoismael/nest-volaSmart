import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRepository } from '../../application/ports/auth.repository.interface';
import { UserDocument } from '../schema/user.schema';
import { User } from '../../domain/entities/user';

@Injectable()
export class MongoAuthRepository implements AuthRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async register(user: User): Promise<User> {
    const created = new this.userModel({
      username: user.username,
      email: user.email,
      password: user.password,
    });
    const result = await created.save();
    return new User(result.id.toString(), result.username, result.email, result.password);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.userModel.findOne({ email }).exec();
    if (!result) return null;
    return new User(result.id.toString(), result.username, result.email, result.password);
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.userModel.findOne({ username }).exec();
    if (!result) return null;
    return new User(result.id.toString(), result.username, result.email, result.password);
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.userModel.findById(id).exec();
    if (!result) return null;
    return new User(result.id.toString(), result.username, result.email, result.password);
  }

  async updateUser(user: User): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        user.id,
        { username: user.username, email: user.email, password: user.password },
        { new: true },
      )
      .exec();
    if (!updated) throw new Error('Utilisateur non trouvé');
    return new User(updated.id.toString(), updated.username, updated.email, updated.password);
  }
}
