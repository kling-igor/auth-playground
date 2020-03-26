import { Connection } from 'mongoose';
import { ConfigItemSchema } from './schemas/item.schema';

import { PERMITTED_COLLECTIONS, DATABASE_CONNECTION } from './constants';

export const modelsProviders = PERMITTED_COLLECTIONS.map(collection => ({
  provide: collection,
  useFactory: (connection: Connection) => {
    console.log('MAKING MODEL', collection, 'for ', connection.name);
    return connection.model(collection, ConfigItemSchema, collection);
  },
  inject: [DATABASE_CONNECTION],
}));
