import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connections, createConnection, Connection } from 'mongoose';

@Injectable()
export class DatabaseConnection {
  constructor(private configService: ConfigService) {}

  async getConnection(dbName): Promise<Connection> {
    const foundConnection = connections.find((con: Connection) => {
      console.log('*** CONNECTION NAME:', con.name);
      return con.name === dbName;
    });

    // Check if connection exist and is ready to execute
    if (foundConnection && foundConnection.readyState === 1) {
      console.log('RETURNING EXISTENT CONNECTION');
      return foundConnection;
    }

    console.log('MAKING NEW CONNECTION');
    // Create a new connection
    return await this.createConnection(dbName);
  }

  private async createConnection(dbName): Promise<Connection> {
    const MONGO_USER = this.configService.get<string>('MONGO_USER');
    const MONGO_PASSWORD = this.configService.get<string>('MONGO_PASSWORD');

    let uri;
    if (dbName === 'config_1') {
      uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds059947.mlab.com:59947/${dbName}`;
    } else if (dbName === 'config_2') {
      uri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds353748.mlab.com:53748/${dbName}`;
    }

    const connection = await createConnection(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    return connection;
  }
}
