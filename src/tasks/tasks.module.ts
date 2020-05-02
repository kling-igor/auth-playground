import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';

import { SingleUseCodeEntity } from '../auth/single-use-code.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SingleUseCodeEntity])],
  providers: [TasksService],
})
export class TasksModule {}
