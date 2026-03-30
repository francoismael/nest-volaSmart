import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountType } from '../../domain/entities/account';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsString()
  description?: string;
}
