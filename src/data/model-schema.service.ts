import { Injectable } from '@nestjs/common';
import { DatabaseConnection } from '../common/db-connection';

@Injectable()
export class ModelSchemaService {
  // handmade memcached
  private modelSchemas: Map<string, any> = new Map<string, any>();

  constructor(private readonly databaseConnection: DatabaseConnection) {}

  async getSchema(modelName: string, project: string, configId: string): Promise<any> {
    const key = `${modelName}_${project}_${configId}`;
    // запрашиваем в кеше по ключу key

    // если нет то берем из коллекции models findOne({name:modelName})
    // разворачиваем content

    // кладем в кеш

    // возвращаем данные
    return {
      source: {
        name: 'docs',
        type: 'doc',
      },
      fields: {
        id: 'string',
        template: 'string',
        date: 'object',
        uptime: 'number',
      },
      primaryKey: ['id'],
    };
  }
}
