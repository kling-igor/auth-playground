import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleUseCodeEntity } from '../auth/single-use-code.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(SingleUseCodeEntity) private readonly singleUseCodesRepository: Repository<SingleUseCodeEntity>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async removeExpiredSingleUseCodes() {
    const { affected: count } = await this.singleUseCodesRepository
      .createQueryBuilder('single_use_codes')
      .delete()
      .where('single_use_codes.expiration_date <= :now', { now: Math.round(new Date().getTime() / 1000) })
      .execute();
    this.logger.debug(`Removed expired single use codes: ${count}`);
  }
}
