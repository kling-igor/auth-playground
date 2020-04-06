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

const getProjectFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, project, filePath);

const getProjectStaticFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, project, 'static', filePath);

const getThumbnailFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.THUMBNAIL_FILES_PATH, project, filePath);

@Controller(':project/file')
export class ProjectFilesController {
  constructor(private readonly projectFileService: ProjectFilesService) {}

  // @Get('get/:fileId/:userToken')
  @Get('get/:fileId')
  async getFile(@Param('project') project: string, @Param('fileId') fileId: string, @Res() response: Response) {
    const filePath = await this.projectFileService.getFilePath(fileId);

    if (filePath) {
      const projectFilePath = getProjectFilePath(project)(filePath);
      const exists = await fs.pathExists(projectFilePath);
      if (exists) {
        return response.sendFile(projectFilePath);
      }
    }

    response.sendStatus(HttpStatus.NOT_FOUND);
  }

  @Get('static/*')
  async getStaticFile(@Param('project') project: string, @Param() params: [string], @Res() response: Response) {
    const filePath = params[0];

    const projectStaticFilePath = getProjectStaticFilePath(project)(filePath);

    const exists = await fs.pathExists(projectStaticFilePath);
    if (exists) {
      return response.sendFile(projectStaticFilePath);
    }

    response.sendStatus(HttpStatus.NOT_FOUND);
  }

  @Get('thumbnail/:fileId/width/:width/height/:height/:userToken') // it is insecure to store token in GET request
  async getThumbnailWithToken(
    @Param('project') project: string,
    @Param('fileId') fileId: string,
    @Param('width') width: string,
    @Param('height') height: string,
    @Res() response: Response,
  ) {
    return response.redirect(`/${project}/file/thumbnail/${fileId}/width/${width}/height/${height}`);
  }

  @Get('thumbnail/:fileId/width/:width/height/:height')
  async getThumbnail(
    @Param('project') project: string,
    @Param('fileId') fileId: string,
    @Param('width') width: string,
    @Param('height') height: string,
    @Res() response: Response,
  ) {
    const filePath = await this.projectFileService.getThumbnailPath(fileId, width, height);

    const thumbnailFilePath = getThumbnailFilePath(project)(filePath);

    const exists = await fs.pathExists(thumbnailFilePath);
    if (exists) {
      return response.sendFile(thumbnailFilePath);
    }

    const sourceFile = await this.projectFileService.getFilePath(fileId);
    const sourceFilePath = getProjectFilePath(project)(sourceFile);

    await this.projectFileService.createThumbnail(sourceFilePath, thumbnailFilePath, parseInt(width), parseInt(height));

    return response.sendFile(thumbnailFilePath);
  }
}
