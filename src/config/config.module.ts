import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

import { ConfigurationController } from './config.controller';
import { ConfigurationService } from './config.service';
// import { ConfigItemSchema } from './schemas/item.schema';
import { ConfigRepository } from './config.repository';

import { modelsProviders } from './models.providers';
import { DatabaseConnection } from './db-connection';
import { databaseConnectionFactory } from './db-connection.factory';

// import { PERMITTED_COLLECTIONS } from './constants';

@Module({
  // imports: [
  //   MongooseModule.forFeature(
  //     PERMITTED_COLLECTIONS.map(collection => ({ name: collection, schema: ConfigItemSchema, collection })),
  //   ),
  // ],
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    ConfigRepository,
    DatabaseConnection,
    ...databaseConnectionFactory,
    ...modelsProviders,
  ],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
