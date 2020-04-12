import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { DatabaseConnection } from '../common/db-connection';
import { PERMITTED_COLLECTIONS } from './constants';
import { ConfigItemSchema } from '../common/item.schema';

@Injectable()
export class ConfigRepository {
  private models: Map<string, any> = new Map<string, any>();

  constructor(private readonly databaseConnection: DatabaseConnection) {}

  private async getModel(dbName, collection) {
    let models = this.models.get(dbName);
    if (!models) {
      const connection = await this.databaseConnection.getConnection(dbName);

      if (!connection) {
        throw new NotFoundException(`Database '${dbName}' does not exist`);
      }

      models = PERMITTED_COLLECTIONS.reduce((acc, collection) => {
        return { ...acc, [collection]: connection.model(collection, ConfigItemSchema, collection) };
      }, {});

      this.models.set(dbName, models);

      connection.once('disconnected', () => {
        this.models.delete(dbName);
      });
    }

    return models[collection];
  }

  async findAll(dbName: string, collection: string, lastUptime): Promise<any[]> {
    const model = await this.getModel(dbName, collection);

    if (model) {
      const result = await model.find({ uptime: { $gte: lastUptime } }, null, { lean: true });

      return result.map(({ _id: id, name, uptime, content }) => ({ id, name, uptime, ...content }));
    }

    console.log('Invalid collection name:', collection);
    return [];
  }

  async upsert(dbName: string, collection: string, documents: [any]): Promise<any> {
    const model = await this.getModel(dbName, collection);
    if (model) {
      for await (const document of documents) {
        const { id, name, uptime, ...content } = document;

        await model.updateOne({ _id: id }, { name, uptime, content }, { upsert: true });
      }
    }
    return;
  }
}
