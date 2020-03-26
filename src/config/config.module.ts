import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigurationController } from './config.controller';
import { ConfigurationService } from './config.service';
import { ConfigItemSchema } from './schemas/item.schema';
import { ConfigRepository } from './config.repository';

import { PERMITTED_COLLECTIONS } from './constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      PERMITTED_COLLECTIONS.map(collection => ({ name: collection, schema: ConfigItemSchema, collection })),
    ),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ConfigRepository],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
