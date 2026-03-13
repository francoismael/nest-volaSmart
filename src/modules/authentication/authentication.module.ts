import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './interfaces/authentication.controller';
import { MongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository';
import { AuthRepositoryToken } from './application/ports/auth.repository.token';
import { RegisterUsecase } from './application/usecases/register.usecase';
import { LoginUsecase } from './application/usecases/login.usecase';
import { GetProfileUsecase } from './application/usecases/get-profile.usecase';
import { userSchema } from './infrastructure/schema/user.schema';
import { TokenBlacklistService } from './application/services/token-blacklist.service';
import { JwtStrategy } from './strategies/strategy.jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
    PassportModule,
    JwtModule.register({
      secret: 'VOLA_SMART_SECRET_KEY',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AuthRepositoryToken, useClass: MongoAuthRepository },
    RegisterUsecase,
    LoginUsecase,
    GetProfileUsecase,
    TokenBlacklistService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [TokenBlacklistService, JwtStrategy, JwtAuthGuard, JwtModule],
})
export class AuthenticationModule {}
