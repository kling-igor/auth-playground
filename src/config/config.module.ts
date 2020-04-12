import { Module, MiddlewareConsumer } from '@nestjs/common';

import { ConfigurationController } from './config.controller';
import { ConfigurationService } from './config.service';
import { ConfigRepository } from './config.repository';
import { DatabaseConnection } from '../common/db-connection';

import { InfoExtractMiddleware } from '../common/info-extract.middleware';

@Module({
  imports: [DatabaseConnection],
  controllers: [ConfigurationController],
  providers: [DatabaseConnection, ConfigurationService, ConfigRepository],
  exports: [ConfigurationService],
})
export class ConfigurationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InfoExtractMiddleware).forRoutes(ConfigurationController);
  }
}
