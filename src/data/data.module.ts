import { Module } from '@nestjs/common';

import { DataController } from './data.controller';
import { DataService } from './data.service';
import { ModelSchemaService } from './model-schema.service';
import { DatabaseConnection } from '../common/db-connection';
import { DocumentRepository } from './document.repository';
import { ConfigRepository } from '../config/config.repository';

import { MemcachedModule, MemcachedService } from '../memcached';

@Module({
  imports: [MemcachedModule],
  controllers: [DataController],
  providers: [
    DatabaseConnection,
    ConfigRepository,
    ModelSchemaService,
    DocumentRepository,
    DataService,
    MemcachedService,
  ],
  exports: [],
})
export class DataModule {}
