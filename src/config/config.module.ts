import { Module } from '@nestjs/common';

import { ConfigurationController } from './config.controller';
import { ConfigurationService } from './config.service';
import { ConfigRepository } from './config.repository';
import { DatabaseConnection } from './db-connection';

@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ConfigRepository, DatabaseConnection],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
