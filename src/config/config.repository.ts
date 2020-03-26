import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ConfigRepository {
  // constructor(
  //   @InjectModel('view') private readonly view: Model<any>,
  //   @InjectModel('controller') private readonly controller: Model<any>,
  // ) {}

  constructor(
    @Inject('view') private readonly view: Model<any>,
    @Inject('controller') private readonly controller: Model<any>,
  ) {
    console.log('CREATING CONFIG REPOSITORY');
  }

  async findAll(collection: string, lastUptime): Promise<any[]> {
    const model = this[collection];

    if (model) {
      const result = await model.find({ uptime: { $gte: lastUptime } }, null, { lean: true });

      return result.map(({ _id: id, ...rest }) => ({ id, ...rest }));
    }

    console.log('Invalid collection name:', collection);
    return [];
  }
}
