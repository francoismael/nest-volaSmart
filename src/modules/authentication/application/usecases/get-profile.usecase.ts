import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepositoryToken } from '../ports/auth.repository.token';
import type { AuthRepository } from '../ports/auth.repository.interface';

@Injectable()
export class GetProfileUsecase {
  constructor(
    @Inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(userId: string): Promise<{ id: string; username: string; email: string; initialBalance: number }> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { id: user.id, username: user.username, email: user.email, initialBalance: user.initialBalance ?? 0 };
  }
}
