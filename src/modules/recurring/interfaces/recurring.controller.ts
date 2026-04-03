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
    today.setUTCHours(0, 0, 0, 0);

    const freq = dto.frequency ?? 'monthly';
    let nextDate: Date;

    if (freq === 'weekly' && dto.daysOfWeek?.length) {
      nextDate = this.nextWeeklyDate(today, dto.daysOfWeek);
    } else if (freq === 'monthly') {
      nextDate = this.nextMonthlyDate(today, dto.dayOfMonth ?? 1);
    } else if (freq === 'yearly') {
      nextDate = this.nextYearlyDate(today);
    } else {
      // daily : première exécution aujourd'hui
      nextDate = today;
    }

    const created = await this.recurringRepo.create({
      label: dto.label,
      amount: dto.amount,
      type: dto.type ?? 'debit',
      frequency: freq,
      dayOfMonth: dto.dayOfMonth ?? 1,
      daysOfWeek: dto.daysOfWeek ?? [1],
      isActive: dto.isActive ?? true,
      userId: req.user.userId,
      notes: dto.notes,
      nextDate,
    });

    try {
      if (dto.isActive !== false) {
        await this.scheduler.processAllDue();
      }
    } catch (_) { /* non-blocking */ }

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
    const updated = await this.recurringRepo.update(id, req.user.userId, data);
    try {
      if (dto.isActive === true) {
        await this.scheduler.processAllDue();
      }
    } catch (_) { /* non-blocking */ }
    return updated;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recurringRepo.delete(id, req.user.userId);
  }

  private nextWeeklyDate(from: Date, daysOfWeek: number[]): Date {
    const sorted = [...daysOfWeek].sort((a, b) => a - b);
    const todayDay = from.getDay();
    const sameOrNext = sorted.find(d => d >= todayDay);
    const d = new Date(from);
    if (sameOrNext !== undefined) {
      d.setUTCDate(d.getUTCDate() + (sameOrNext - todayDay));
    } else {
      d.setUTCDate(d.getUTCDate() + (7 - todayDay + sorted[0]));
    }
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private nextMonthlyDate(from: Date, dayOfMonth: number): Date {
    const y = from.getUTCFullYear();
    const m = from.getUTCMonth();
    const maxThisMonth = new Date(y, m + 1, 0).getUTCDate();
    const dayThisMonth = Math.min(dayOfMonth, maxThisMonth);
    const candidate = new Date(Date.UTC(y, m, dayThisMonth));
    if (candidate >= from) return candidate;
    // Ce mois-ci est déjà passé → mois prochain
    const maxNextMonth = new Date(y, m + 2, 0).getUTCDate();
    return new Date(Date.UTC(y, m + 1, Math.min(dayOfMonth, maxNextMonth)));
  }

  private nextYearlyDate(from: Date): Date {
    const y = from.getUTCFullYear();
    const m = from.getUTCMonth();
    const day = from.getUTCDate();
    const candidate = new Date(Date.UTC(y, m, day));
    if (candidate >= from) return candidate;
    return new Date(Date.UTC(y + 1, m, day));
  }
}
