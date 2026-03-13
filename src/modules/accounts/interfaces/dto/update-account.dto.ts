import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountType } from '../../domain/entities/account';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsString()
  description?: string;
}
