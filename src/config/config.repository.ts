import { Injectable } from '@nestjs/common';

import { DatabaseConnection } from './db-connection';
import { PERMITTED_COLLECTIONS } from './constants';
import { ConfigItemSchema } from './schemas/item.schema';

@Injectable()
export class ConfigRepository {
  private models: Map<string, any> = new Map<string, any>();

  constructor(private readonly databaseConnection: DatabaseConnection) {}

  private async getModel(dbName, collection) {
    let models = this.models.get(dbName);
    if (!models) {
      const connection = await this.databaseConnection.getConnection(dbName);

      models = PERMITTED_COLLECTIONS.reduce((acc, collection) => {
        return { ...acc, [collection]: connection.model(collection, ConfigItemSchema, collection) };
      }, {});

      this.models.set(dbName, models);
    }

    return models[collection];
  }

  async findAll(dbName, collection: string, lastUptime): Promise<any[]> {
    const model = await this.getModel(dbName, collection);

    if (model) {
      const result = await model.find({ uptime: { $gte: lastUptime } }, null, { lean: true });

      return result.map(({ _id: id, ...rest }) => ({ id, ...rest }));
    }

    console.log('Invalid collection name:', collection);
    return [];
  }
}
