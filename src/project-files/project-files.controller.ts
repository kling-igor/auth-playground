import { Controller, Get, Res, HttpStatus, Param, UseGuards } from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import * as fs from 'fs-extra';
import * as path from 'path';
import { Response } from 'express';

import { ProjectFilesService } from './project-files.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const getProjectFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, project, filePath);

const getProjectStaticFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, project, 'static', filePath);

const getThumbnailFilePath = project => filePath =>
  path.join(path.dirname(require.main.filename), process.env.THUMBNAIL_FILES_PATH, project, filePath);

@ApiTags('File')
@ApiBearerAuth()
@Controller(':project/file')
export class ProjectFilesController {
  constructor(private readonly projectFileService: ProjectFilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get/:fileId/:userToken')
  @ApiOperation({ summary: 'Download project file', description: 'Downloads project file by specified fileId' })
  @ApiOkResponse({ description: 'Download file' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  async getFileWithToken(
    @Param('project') project: string,
    @Param('fileId') fileId: string,
    @Param('userToken') userToken: string,
    @Res() response: Response,
  ) {
    return response.redirect(`get/${fileId}`);
  }

  @Get('get/:fileId')
  @ApiOperation({ summary: 'Download project file', description: 'Downloads project file by specified fileId' })
  @ApiOkResponse({ description: 'Download file' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
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
  @ApiOperation({
    summary: 'Download project static file',
    description: 'Downloads project static file by path specified in parameters',
  })
  @ApiOkResponse({
    description: 'Download file',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  async getStaticFile(@Param('project') project: string, @Param() params: [string], @Res() response: Response) {
    const filePath = params[0];

    if (filePath.includes('.')) {
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }

    const projectStaticFilePath = getProjectStaticFilePath(project)(filePath);

    const exists = await fs.pathExists(projectStaticFilePath);
    if (exists) {
      return response.sendFile(projectStaticFilePath);
    }

    response.sendStatus(HttpStatus.NOT_FOUND);
  }

  @Get('thumbnail/:fileId/width/:width/height/:height/:userToken') // it is insecure to store token in GET request
  @ApiOperation({ summary: 'Download thumbnail', description: 'Downloads image thumbnail of specified size' })
  @ApiOkResponse({
    description: 'Download file',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
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
  @ApiOperation({ summary: 'Download thumbnail', description: 'Download image thumbnail of specified size' })
  @ApiOkResponse({
    description: 'Download file',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
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
