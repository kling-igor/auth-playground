import { Module, MiddlewareConsumer } from '@nestjs/common';

import { DataController } from './data.controller';
import { DataService } from './data.service';
import { ModelSchemaService } from './model-schema.service';
import { DatabaseConnection } from '../common/db-connection';
import { DocumentRepository } from './document.repository';

import { InfoExtractMiddleware } from '../common/info-extract.middleware';

@Module({
  imports: [DatabaseConnection],
  controllers: [DataController],
  providers: [DatabaseConnection, DataService, ModelSchemaService, DocumentRepository],
  exports: [],
})
export class DataModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InfoExtractMiddleware).forRoutes(DataController);
  }
}
