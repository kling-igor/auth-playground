import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigRepository } from '../config/config.repository';

@Injectable()
export class ModelSchemaService {
  // handmade memcached
  private modelSchemas: Map<string, any> = new Map<string, any>();

  constructor(private readonly configRepository: ConfigRepository) {}

  async getSchema(modelName: string, project: string, configId: string): Promise<any> {
    const key = `${modelName}_${project}_${configId}`;

    let schema = this.modelSchemas.get(key);

    if (!schema) {
      const dbName = `${project}_${configId}`;

      const model = await this.configRepository.findModel(dbName, modelName);

      if (!model) {
        throw new NotFoundException(`Model '${modelName}' does not exist in db '${dbName}'`);
      }

      const {
        content: { source, fields, primaryKey = ['id'] },
      } = model;

      schema = {
        source,
        fields,
        primaryKey,
      };

      this.modelSchemas.set(key, schema);
    }

    return schema;
  }
}
