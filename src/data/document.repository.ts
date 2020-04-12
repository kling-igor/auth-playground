import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import ObjectID from 'bson-objectid';

import { DatabaseConnection } from '../common/db-connection';
import { ConfigItemSchema } from '../common/item.schema';

@Injectable()
export class DocumentRepository {
  private models: Map<string, any> = new Map<string, any>();

  constructor(private readonly databaseConnection: DatabaseConnection) {}

  private async getModel(dbName, collection) {
    const key = `${dbName}_${collection}`;
    let model = this.models.get(key);
    if (!model) {
      const connection = await this.databaseConnection.getConnection(dbName);

      if (!connection) {
        throw new NotFoundException(`Database '${dbName}' does not exist`);
      }

      model = connection.model(collection, ConfigItemSchema, collection);

      this.models.set(key, model);

      connection.once('disconnected', () => {
        this.models.delete(key);
      });
    }

    return model;
  }

  async save(project: string, collection: string, document: any) {
    const model = await this.getModel(project, collection);

    if (model) {
      const { id = ObjectID.generate(), name, uptime, ...content } = document;

      return await model.findOneAndUpdate(
        { _id: id },
        { name, uptime, content },
        { upsert: true, new: true, lean: true },
      );
    }
  }
}
