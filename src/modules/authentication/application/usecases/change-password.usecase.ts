import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthRepositoryToken } from '../ports/auth.repository.token';
import type { AuthRepository } from '../ports/auth.repository.interface';

@Injectable()
export class ChangePasswordUsecase {
  constructor(
    @Inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Mot de passe actuel incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updateUser(user);
  }
}
