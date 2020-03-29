import { Connection } from 'mongoose';

import { FileSchema } from './schemas/file.schema';
import { FILE_MODEL, FILESERVICE_DB_CONNECTION } from './constants';

export const fileProvider = {
  provide: FILE_MODEL,
  useFactory: (connection: Connection) => connection.model('File', FileSchema),
  inject: [FILESERVICE_DB_CONNECTION],
};
