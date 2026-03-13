import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { GetLedgerUsecase } from '../application/usecases/get-ledger.usecase';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly getLedgerUsecase: GetLedgerUsecase) {}

  @Get()
  async getLedger(@Request() req: RequestWithUser) {
    return this.getLedgerUsecase.execute(req.user.userId);
  }
}
