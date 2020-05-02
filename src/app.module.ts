import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConnectionOptions } from 'typeorm';
// import { MongooseModule } from '@nestjs/mongoose';

// import * as mongoose from 'mongoose';
// mongoose.set('debug', true);

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ConfigurationModule } from './config/config.module';
import { ProjectFilesModule } from './project-files/project-files.module';
import { DataModule } from './data/data.module';

import { MemcachedModule } from './memcached';

import { DatabaseConnection } from './common/db-connection';
import { GoogleModule } from './google/google.module';
import { FacebookModule } from './facebook/facebook.module';
import { AppleModule } from './apple/apple.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      // envFilePath: '.development.env',
      // ignoreEnvFile: true, // this ignores file and relies on environment variables from the runtime environment
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   connectionName: 'fileService',
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('FILE_SERVICE_MONGO_URL'),
    //     useUnifiedTopology: true,
    //     useNewUrlParser: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRESS_DB'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          /* Number of attempts to connect to the database (default: 10) */
          // retryAttempts: 5,
          /* Delay between connection retry attempts (ms) (default: 3000) */
          // retryDelay: 3000,
          /* If true, entities will be loaded automatically (default: false) */
          // autoLoadEntities: true,
          /* If true, connection will not be closed on application shutdown (default: false) */
          // keepConnectionAlive: true,
        } as TypeOrmModuleOptions;
      },
    }),
    MemcachedModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const MEMCACHED_URI = configService.get<string>('MEMCACHED_URI') || '';
        return {
          uri: MEMCACHED_URI.replace(/\s/g, '').split(','),
          // use other memcached options here
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    FileModule,
    ConfigurationModule,
    ProjectFilesModule,
    DataModule,
    GoogleModule,
    FacebookModule,
    AppleModule,
    TasksModule,
  ],
  // controllers: [],
  providers: [DatabaseConnection],
  exports: [],
})
export class AppModule {}
