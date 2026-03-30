import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { CreateOperationUsecase } from '../application/usecases/create-operation.usecase';
import { FindAllOperationsUsecase } from '../application/usecases/find-all-operations.usecase';
import { FindOperationByIdUsecase } from '../application/usecases/find-operation-by-id.usecase';
import { UpdateOperationUsecase } from '../application/usecases/update-operation.usecase';
import { DeleteOperationUsecase } from '../application/usecases/delete-operation.usecase';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

interface RequestWithUser {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('operations')
export class OperationsController {
  constructor(
    private readonly createOperationUsecase: CreateOperationUsecase,
    private readonly findAllOperationsUsecase: FindAllOperationsUsecase,
    private readonly findOperationByIdUsecase: FindOperationByIdUsecase,
    private readonly updateOperationUsecase: UpdateOperationUsecase,
    private readonly deleteOperationUsecase: DeleteOperationUsecase,
  ) {}

  @Post()
  async create(@Request() req: RequestWithUser, @Body() dto: CreateOperationDto) {
    return this.createOperationUsecase.execute(
      new Date(dto.date),
      dto.label,
      dto.debit ?? 0,
      dto.credit ?? 0,
      '',
      req.user.userId,
      dto.notes,
      dto.category,
    );
  }

  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate:   endDate   ? new Date(endDate)   : undefined,
      page:      page  ? parseInt(page,  10) : undefined,
      limit:     limit ? parseInt(limit, 10) : undefined,
    };
    if (filter.page !== undefined || filter.limit !== undefined) {
      return this.findAllOperationsUsecase.executePaginated(req.user.userId, filter);
    }
    return this.findAllOperationsUsecase.execute(req.user.userId, filter);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.findOperationByIdUsecase.execute(id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateOperationDto,
  ) {
    return this.updateOperationUsecase.execute(
      id,
      req.user.userId,
      dto.date ? new Date(dto.date) : undefined,
      dto.label,
      dto.debit,
      dto.credit,
      undefined,
      dto.notes,
      dto.category,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.deleteOperationUsecase.execute(id, req.user.userId);
  }
}
