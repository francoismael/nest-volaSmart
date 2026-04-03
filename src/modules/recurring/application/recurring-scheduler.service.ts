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
    try {
      await this.processAllDue();
    } catch (err) {
      this.logger.warn('processAllDue failed on bootstrap (safe to ignore in serverless)', err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyCron() {
    await this.processAllDue();
  }

  async processAllDue(): Promise<void> {
    try {
    const today = this.startOfDay(new Date());
    const allActive = await this.recurringModel.find({ isActive: true }).exec();
    this.logger.log(`processAllDue: today=${today.toISOString()}, ${allActive.length} actifs`);

    let created = 0;
    for (const rec of allActive) {
      let nextDate: Date;
      if (!rec.nextDate || isNaN(new Date(rec.nextDate).getTime())) {
        // nextDate manquant → traiter comme dû aujourd'hui
        nextDate = today;
        this.logger.warn(`  → "${rec.label}" nextDate manquant, traité comme aujourd'hui`);
      } else {
        nextDate = this.startOfDay(new Date(rec.nextDate));
      }
      this.logger.log(`  → "${rec.label}" nextDate=${nextDate.toISOString()} due=${nextDate <= today}`);
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
    } catch (err) {
      this.logger.error('processAllDue failed', err);
    }
  }

  private computeNextDate(
    from: Date,
    frequency: string,
    dayOfMonth: number,
    daysOfWeek?: number[],
  ): Date {
    let d = new Date(from);

    switch (frequency) {
      case 'daily':
        d.setUTCDate(d.getUTCDate() + 1);
        break;

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const sorted = [...daysOfWeek].sort((a, b) => a - b);
          const currentDay = d.getUTCDay();
          const nextDay = sorted.find(day => day > currentDay);
          if (nextDay !== undefined) {
            d.setUTCDate(d.getUTCDate() + (nextDay - currentDay));
          } else {
            d.setUTCDate(d.getUTCDate() + (7 - currentDay + sorted[0]));
          }
        } else {
          d.setUTCDate(d.getUTCDate() + 7);
        }
        break;

      case 'monthly': {
        const nextMonth = d.getUTCMonth() + 1;
        const nextYear = d.getUTCFullYear() + (nextMonth > 11 ? 1 : 0);
        const m = nextMonth % 12;
        const maxDay = this.daysInMonth(nextYear, m);
        d = new Date(Date.UTC(nextYear, m, Math.min(dayOfMonth || 1, maxDay)));
        break;
      }

      case 'yearly':
        d = new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()));
        break;
    }

    return d;
  }

  private startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setUTCHours(0, 0, 0, 0);
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
