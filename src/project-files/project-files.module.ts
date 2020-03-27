import { Module } from '@nestjs/common';
import { ProjectFilesController } from './project-files.controller';
@Module({
  imports: [],
  controllers: [ProjectFilesController],
  providers: [],
  exports: [],
})
export class ProjectFilesModule {}
