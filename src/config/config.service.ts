import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { ConfigRepository } from './config.repository';

import { PERMITTED_COLLECTIONS } from './constants';

import { UploadConfigurationRequestDto } from './dto/upload-configuration.request.dto';
import { ConfigurationSlice } from './dto/download-configuration.response.dto';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configDb: ConfigRepository) {}

  async uploadConfiguration(dbName: string, configuration: UploadConfigurationRequestDto): Promise<void> {
    const plainConfiguration = classToPlain(configuration);
    const configurationKeys = Object.keys(plainConfiguration);

    const collections = configurationKeys.filter(item => PERMITTED_COLLECTIONS.includes(item));

    for await (const collection of collections) {
      // save documents
      // console.log(`SAVE COLLECTION '${collection}' documents:${configuration[collection].length}`);

      await this.configDb.upsert(dbName, collection, configuration[collection]);
    }

    return;
  }

  async downloadConfiguration(dbName: string, collections: [string], lastUptime = 0): Promise<ConfigurationSlice> {
    const checkedCollections = collections.filter(item => PERMITTED_COLLECTIONS.includes(item));

    const result = {};

    for await (const collection of checkedCollections) {
      result[collection] = await this.configDb.findAll(dbName, collection, lastUptime);
    }

    return plainToClass(ConfigurationSlice, {
      ...result,
      serverUptime: (Date.now() / 1000) | 0,
    });
  }
}
