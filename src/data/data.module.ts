import { Module } from '@nestjs/common';

import { DataController } from './data.controller';
import { DataService } from './data.service';
import { ModelSchemaService } from './model-schema.service';
import { DatabaseConnection } from '../common/db-connection';
import { DocumentRepository } from './document.repository';

@Module({
  imports: [DatabaseConnection],
  controllers: [DataController],
  providers: [DatabaseConnection, DataService, ModelSchemaService, DocumentRepository],
  exports: [],
})
export class DataModule {}
