import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepositoryToken } from '../ports/auth.repository.token';
import type { AuthRepository } from '../ports/auth.repository.interface';

@Injectable()
export class UpdateProfileUsecase {
  constructor(
    @Inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(
    userId: string,
    username?: string,
    email?: string,
    initialBalance?: number,
  ): Promise<{ id: string; username: string; email: string; initialBalance: number }> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (email && email !== user.email) {
      const existing = await this.authRepository.findByEmail(email);
      if (existing) throw new ConflictException('Cet email est déjà utilisé');
      user.email = email;
    }

    if (username) user.username = username;
    if (initialBalance !== undefined) user.initialBalance = initialBalance;

    const updated = await this.authRepository.updateUser(user);
    return { id: updated.id, username: updated.username, email: updated.email, initialBalance: updated.initialBalance ?? 0 };
  }
}
