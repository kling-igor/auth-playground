import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Connection } from 'mongoose';

import { DATABASE_CONNECTION } from './constants';
import { DatabaseConnection } from './db-connection';
export const databaseConnectionFactory = [
  {
    provide: 'DB_NAME',
    scope: Scope.REQUEST,
    inject: [REQUEST],
    useFactory: (req: Request): string => {
      const marmToken = req.headers['x-marm-token'];
      const projectVersion = req.headers['x-project-version'];
      const project = marmToken.split('_').shift();
      const configId = projectVersion.replace('v1d', '');
      const dbName = `${project}_${configId}`;

      console.log('PROVIDING DB_NAME ', dbName);

      return dbName;
    },
  },
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (dbName: string, connection: DatabaseConnection): Promise<Connection> => {
      console.log('GET DATABASE CONNECTION', dbName);
      return connection.getConnection(dbName);
    },
    inject: ['DB_NAME', DatabaseConnection],
  },
];
