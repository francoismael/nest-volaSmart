import { IsString, IsNumber, Min, Matches } from 'class-validator';

export class UpsertBudgetDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
