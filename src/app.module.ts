import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
mongoose.set('debug', true);

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ConfigurationModule } from './config/config.module';
import { ProjectFilesModule } from './project-files/project-files.module';

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
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URL'),
    //     useUnifiedTopology: true,
    //     useNewUrlParser: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    AuthModule,
    UserModule,
    FileModule,
    ConfigurationModule,
    ProjectFilesModule,
  ],
  // controllers: [],
  // providers: [],
})
export class AppModule {}
