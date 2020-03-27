import { Module } from '@nestjs/common';
import { ProjectFilesController } from './project-files.controller';
import { ProjectFilesService } from './project-files.service';

@Module({
  imports: [],
  controllers: [ProjectFilesController],
  providers: [ProjectFilesService],
  exports: [],
})
export class ProjectFilesModule {}
