import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { CreateAccountUsecase } from '../application/usecases/create-account.usecase';
import { FindAllAccountsUsecase } from '../application/usecases/find-all-accounts.usecase';
import { UpdateAccountUsecase } from '../application/usecases/update-account.usecase';
import { DeleteAccountUsecase } from '../application/usecases/delete-account.usecase';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountUsecase: CreateAccountUsecase,
    private readonly findAllAccountsUsecase: FindAllAccountsUsecase,
    private readonly updateAccountUsecase: UpdateAccountUsecase,
    private readonly deleteAccountUsecase: DeleteAccountUsecase,
  ) {}

  @Post()
  async create(@Request() req: RequestWithUser, @Body() dto: CreateAccountDto) {
    return this.createAccountUsecase.execute(dto.name, dto.type, req.user.userId, dto.description);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.findAllAccountsUsecase.execute(req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.updateAccountUsecase.execute(id, req.user.userId, dto.name, dto.type, dto.description);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.deleteAccountUsecase.execute(id, req.user.userId);
  }
}
