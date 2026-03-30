import { BadRequestException, Body, Controller, Delete, Get, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { UpsertBudgetUsecase } from '../application/usecases/upsert-budget.usecase';
import { DeleteBudgetUsecase } from '../application/usecases/delete-budget.usecase';
import { GetBudgetSummaryUsecase } from '../application/usecases/get-budget-summary.usecase';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly upsertBudget: UpsertBudgetUsecase,
    private readonly deleteBudget: DeleteBudgetUsecase,
    private readonly getBudgetSummary: GetBudgetSummaryUsecase,
  ) {}

  /** GET /budgets/summary?month=YYYY-MM */
  @Get('summary')
  getSummary(@Request() req: RequestWithUser, @Query('month') month: string) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('month query param must be in YYYY-MM format');
    }
    return this.getBudgetSummary.execute(req.user.userId, month);
  }

  /** PUT /budgets — create or update a budget line */
  @Put()
  upsert(@Request() req: RequestWithUser, @Body() dto: UpsertBudgetDto) {
    return this.upsertBudget.execute(req.user.userId, dto.month, dto.category, dto.amount);
  }

  /** DELETE /budgets/:month/:category */
  @Delete(':month/:category')
  remove(
    @Request() req: RequestWithUser,
    @Param('month') month: string,
    @Param('category') category: string,
  ) {
    return this.deleteBudget.execute(req.user.userId, month, category);
  }
}
