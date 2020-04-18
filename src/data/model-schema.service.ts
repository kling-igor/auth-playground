import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigRepository } from '../config/config.repository';
import { MemcachedService } from '../memcached';

@Injectable()
export class ModelSchemaService {
  // private modelSchemas: Map<string, any> = new Map<string, any>();

  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly memcachedService: MemcachedService,
  ) {}

  async getSchema(modelName: string, project: string, configId: string): Promise<any> {
    const key = `${modelName}_${project}_${configId}`;

    // let schema = this.modelSchemas.get(key);
    let schema = await this.memcachedService.get(key);

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

      // this.modelSchemas.set(key, schema);
      await this.memcachedService.set(key, schema, 3600);
    }

    return schema;
  }
}
