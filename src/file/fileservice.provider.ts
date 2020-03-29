import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

import { FILESERVICE_DB_CONNECTION } from './constants';

export const fileServiceDatabaseProvider = {
  provide: FILESERVICE_DB_CONNECTION,
  useFactory: async (configService: ConfigService): Promise<mongoose.Connection> =>
    mongoose.createConnection(configService.get<string>('FILE_SERVICE_MONGO_URL'), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
  inject: [ConfigService],
};
