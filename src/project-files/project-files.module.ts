import { Module } from '@nestjs/common';
import { ProjectFilesController } from './project-files.controller';
import { ProjectFilesService } from './project-files.service';

import { FileModule } from '../file/file.module';

@Module({
  imports: [FileModule],
  controllers: [ProjectFilesController],
  providers: [ProjectFilesService],
  exports: [],
})
export class ProjectFilesModule {}
