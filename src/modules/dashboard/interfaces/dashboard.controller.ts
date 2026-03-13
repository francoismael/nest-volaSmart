import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { GetDashboardUsecase } from '../application/usecases/get-dashboard.usecase';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUsecase: GetDashboardUsecase) {}

  @Get()
  async getDashboard(@Request() req: RequestWithUser) {
    return this.getDashboardUsecase.execute(req.user.userId);
  }
}
