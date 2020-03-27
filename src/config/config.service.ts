import { Injectable } from '@nestjs/common';

import { ConfigRepository } from './config.repository';

import { PERMITTED_COLLECTIONS } from './constants';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configDb: ConfigRepository) {
    console.log('CREATING CONFIG SERVICE');
  }

  async uploadConfiguration(dbName: string, configuration: any): Promise<void> {
    const collections = Object.keys(configuration).filter(item => PERMITTED_COLLECTIONS.includes(item));

    for await (const collection of collections) {
      // save documents
    }

    return;
  }

  async syncConfiguration(dbName: string, collections: [string], lastUptime = 0): Promise<any> {
    const checkedCollections = collections.filter(item => PERMITTED_COLLECTIONS.includes(item));

    const result = {};

    for await (const collection of checkedCollections) {
      const found = await this.configDb.findAll(dbName, collection, lastUptime);
      result[collection] = found;
    }

    return {
      ...result,
      serverUptime: (Date.now() / 1000) | 0,
    };
  }
}
