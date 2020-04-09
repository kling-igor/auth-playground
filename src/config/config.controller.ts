import {
  Controller,
  Post,
  Get,
  Res,
  Query,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Header,
} from '@nestjs/common';

import { Response } from 'express';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import * as path from 'path';
import * as fs from 'fs-extra';

import { ConfigurationService } from './config.service';

@ApiTags('Config')
@Controller()
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async upload(
    @Headers('x-marm-token') token: string,
    @Headers('x-project-version') projectVersion: string,
    @Body() configuration: any,
  ) {
    const project = token.split('_').shift();
    const configId = projectVersion.replace('v1d', '');
    const dbName = `${project}_${configId}`;

    await this.configService.uploadConfiguration(dbName, configuration);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Headers('x-marm-token') token: string,
    @Headers('x-project-version') projectVersion: string,
    @Body('get') collections: [string],
    @Body('uptime') lastUptime: number,
  ) {
    const project = token.split('_').shift();
    const configId = projectVersion.replace('v1d', '');
    const dbName = `${project}_${configId}`;

    const data = await this.configService.syncConfiguration(dbName, collections, lastUptime);

    return {
      data: [data],
      code: HttpStatus.OK,
      message: '',
    };
  }

  // FOR DBT TEST PURPOSES
  @Get('sync')
  @HttpCode(HttpStatus.OK)
  async getConfiguration(@Res() response: Response) {
    const filePath = path.resolve(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, 'config.json');

    if (filePath) {
      const exists = await fs.pathExists(filePath);
      if (exists) {
        return response.sendFile(filePath);
      }
    }

    console.log('FILE NOT FOUND', filePath);

    response.sendStatus(HttpStatus.NOT_FOUND);
  }
}
