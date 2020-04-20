import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from './file.entity';

import { FileController } from './file.conroller';
import { FileService } from './file.service';
import { fileServiceDatabaseProvider } from './file-service.provider';
import { fileProvider } from './file.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: `./${configService.get<string>('STATIC_FILES_PATH')}`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FileController],
  providers: [FileService, fileProvider, fileServiceDatabaseProvider],
  exports: [fileProvider, fileServiceDatabaseProvider],
})
export class FileModule {}
