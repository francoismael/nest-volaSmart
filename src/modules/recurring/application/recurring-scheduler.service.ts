import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecurringOperationDocument } from '../infrastructure/schema/recurring-operation.schema';
import { OperationDocument } from '../../operations/infrastructure/schema/operation.schema';

@Injectable()
export class RecurringSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RecurringSchedulerService.name);

  constructor(
    @InjectModel('RecurringOperation')
    private readonly recurringModel: Model<RecurringOperationDocument>,
    @InjectModel('Operation')
    private readonly operationModel: Model<OperationDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.processAllDue();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyCron() {
    await this.processAllDue();
  }

  async processAllDue(): Promise<void> {
    const today = this.startOfDay(new Date());
    const allActive = await this.recurringModel.find({ isActive: true }).exec();

    let created = 0;
    for (const rec of allActive) {
      const nextDate = this.startOfDay(new Date(rec.nextDate));
      if (nextDate <= today) {
        await this.operationModel.create({
          date: today,
          label: rec.label,
          debit: rec.type === 'debit' ? rec.amount : 0,
          credit: rec.type === 'credit' ? rec.amount : 0,
          userId: rec.userId,
          notes: rec.notes ?? `[Auto] ${this.freqLabel(rec.frequency)}`,
        });

        const next = this.computeNextDate(today, rec.frequency, rec.dayOfMonth, rec.daysOfWeek);
        rec.lastExecutedDate = today;
        rec.nextDate = next;
        await rec.save();
        created++;
      }
    }

    if (created > 0) {
      this.logger.log(`${created} opération(s) récurrente(s) créée(s)`);
    }
  }

  private computeNextDate(
    from: Date,
    frequency: string,
    dayOfMonth: number,
    daysOfWeek?: number[],
  ): Date {
    const d = new Date(from);

    switch (frequency) {
      case 'daily':
        d.setDate(d.getDate() + 1);
        break;

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const sorted = [...daysOfWeek].sort((a, b) => a - b);
          const currentDay = d.getDay();
          // Prochain jour dans la liste, strictement après aujourd'hui
          const nextDay = sorted.find(day => day > currentDay);
          if (nextDay !== undefined) {
            d.setDate(d.getDate() + (nextDay - currentDay));
          } else {
            // Revenir au premier jour de la liste la semaine prochaine
            d.setDate(d.getDate() + (7 - currentDay + sorted[0]));
          }
        } else {
          d.setDate(d.getDate() + 7);
        }
        break;

      case 'monthly':
        d.setMonth(d.getMonth() + 1);
        d.setDate(Math.min(dayOfMonth || 1, this.daysInMonth(d.getFullYear(), d.getMonth())));
        break;

      case 'yearly':
        d.setFullYear(d.getFullYear() + 1);
        break;
    }

    return this.startOfDay(d);
  }

  private startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  private daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  private freqLabel(f: string): string {
    const labels: Record<string, string> = {
      daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel', yearly: 'Annuel',
    };
    return labels[f] ?? f;
  }
}
