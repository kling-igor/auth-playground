import {
  Controller,
  Get,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Param,
  NotFoundException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import * as fs from 'fs-extra';
import * as path from 'path';
import { Response } from 'express';

import { ProjectFilesService } from './project-files.service';

@Controller(':project/file')
export class ProjectFilesController {
  constructor(private readonly projectFileService: ProjectFilesService) {}

  // @Get('get/:fileId/:userToken')
  @Get('get/:fileId')
  async getFile(@Param('project') project: string, @Param('fileId') fileId: string, @Res() response: Response) {
    const filePath = await this.projectFileService.getFilePath(project, fileId);

    if (filePath) {
      try {
        const fullPath = path.join(
          path.dirname(require.main.filename),
          process.env.STATIC_FILES_PATH,
          project,
          filePath,
        );
        return response.sendFile(fullPath);
      } catch (e) {
        console.log('E:', e);
      }
    }

    response.sendStatus(HttpStatus.NOT_FOUND);
  }

  @Get('static/*')
  async getStaticFile(@Param('project') project: string, @Param() params: [string], @Res() response: Response) {
    const filePath = params[0];

    const fullPath = path.join(
      path.dirname(require.main.filename),
      process.env.STATIC_FILES_PATH,
      project,
      'static',
      filePath,
    );

    try {
      return response.sendFile(fullPath);
    } catch (e) {
      console.log('E:', e);
    }

    response.sendStatus(HttpStatus.NOT_FOUND);
  }

  @Get('thumbnail/:fileId/width/:width/height/:height/:userToken')
  async getThumbnail(
    @Param('project') project: string,
    @Param('fileId') fileId: string,
    @Param('width') width: number,
    @Param('height') height: number,
  ) {
    // lookup in fs

    return this.projectFileService.getThumbnail(project, fileId, width, height);
  }
}
