import { Module } from '@nestjs/common';

import { ConfigurationController } from './config.controller';
import { ConfigurationService } from './config.service';
import { ConfigRepository } from './config.repository';
import { DatabaseConnection } from '../common/db-connection';

@Module({
  imports: [DatabaseConnection],
  controllers: [ConfigurationController],
  providers: [DatabaseConnection, ConfigurationService, ConfigRepository],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
