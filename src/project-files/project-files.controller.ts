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

@Controller(':project/file')
export class ProjectFilesController {
  @Get('get/:fileId/:userToken')
  async getFile(@Param('project') project: string, @Param('fileId') fileId: string) {
    console.log('PROJECT:', project);
    console.log('FILE ID:', fileId);

    // lookup file in DB - get path - responce file stream
    return;
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

    console.log(fullPath);

    const exists = await fs.exists(fullPath);
    if (exists) {
      response.sendFile(fullPath);
    } else {
      response.sendStatus(HttpStatus.NOT_FOUND);
    }
  }

  @Get('thumbnail/:fileId/width/:width/height/:height/:userToken')
  async getThumbnail(
    @Param('project') project: string,
    @Param('fileId') fileId: string,
    @Param('width') width: string,
    @Param('height') height: string,
  ) {
    // lookup in fs

    return;
  }
}
