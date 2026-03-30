import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepositoryToken } from '../ports/auth.repository.token';
import type { AuthRepository } from '../ports/auth.repository.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginUsecase {
  constructor(
    @Inject(AuthRepositoryToken)
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.authRepository.findByUsername(username);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Identifiants invalides');

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
