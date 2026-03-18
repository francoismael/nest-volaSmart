import {
  Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard';
import { MongoRecurringRepository } from '../infrastructure/repositories/mongo-recurring.repository';
import { RecurringSchedulerService } from '../application/recurring-scheduler.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

interface RequestWithUser { user: { userId: string }; }

@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(
    private readonly recurringRepo: MongoRecurringRepository,
    private readonly scheduler: RecurringSchedulerService,
  ) {}

  @Post()
  async create(@Request() req: RequestWithUser, @Body() dto: CreateRecurringDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pour weekly, calculer la prochaine occurrence parmi les jours sélectionnés
    let nextDate = today;
    if (dto.frequency === 'weekly' && dto.daysOfWeek?.length) {
      nextDate = this.nextWeeklyDate(today, dto.daysOfWeek);
    }

    const created = await this.recurringRepo.create({
      label: dto.label,
      amount: dto.amount,
      type: dto.type ?? 'debit',
      frequency: dto.frequency ?? 'monthly',
      dayOfMonth: dto.dayOfMonth ?? 1,
      daysOfWeek: dto.daysOfWeek ?? [1],
      isActive: dto.isActive ?? true,
      userId: req.user.userId,
      notes: dto.notes,
      nextDate,
    });

    await this.scheduler.processAllDue();
    return created;
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.recurringRepo.findAll(req.user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recurringRepo.findById(id, req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: RequestWithUser, @Body() dto: UpdateRecurringDto) {
    const data: any = {};
    if (dto.label !== undefined) data.label = dto.label;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.dayOfMonth !== undefined) data.dayOfMonth = dto.dayOfMonth;
    if (dto.daysOfWeek !== undefined) data.daysOfWeek = dto.daysOfWeek;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.recurringRepo.update(id, req.user.userId, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recurringRepo.delete(id, req.user.userId);
  }

  private nextWeeklyDate(from: Date, daysOfWeek: number[]): Date {
    const sorted = [...daysOfWeek].sort((a, b) => a - b);
    const todayDay = from.getDay();
    // Chercher le prochain jour >= aujourd'hui dans la liste
    const sameOrNext = sorted.find(d => d >= todayDay);
    const d = new Date(from);
    if (sameOrNext !== undefined) {
      d.setDate(d.getDate() + (sameOrNext - todayDay));
    } else {
      // La semaine prochaine
      d.setDate(d.getDate() + (7 - todayDay + sorted[0]));
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
