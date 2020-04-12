import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { plainToClass } from 'class-transformer';

import { Response } from 'express';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

// import * as path from 'path';
// import * as fs from 'fs-extra';

import { ConfigurationService } from './config.service';

import { UploadConfigurationRequestDto } from './dto/upload-configuration.request.dto';
import { DownloadConfigurationResponseDto, ConfigurationSlice } from './dto/download-configuration.response.dto';
import { DownloadConfigurationRequestDto } from './dto/download-configuration.request.dto';

import { Project } from '../common/project.decorator';
import { ConfigId } from '../common/config-id.decorator';

@ApiTags('Configuration')
@Controller()
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload configuration to specified database' })
  @ApiOkResponse({ description: 'Upload configuration successfully' })
  @ApiBody({ type: UploadConfigurationRequestDto })
  @HttpCode(HttpStatus.OK)
  async upload(
    @Project() project: string,
    @ConfigId() configId: string,
    @Body() configuration: UploadConfigurationRequestDto,
  ): Promise<void> {
    const dbName = `${project}_${configId}`;

    await this.configService.uploadConfiguration(dbName, configuration);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Download configuration from specified database' })
  @ApiOkResponse({ description: 'Download configuration successfully' })
  @ApiNotFoundResponse({ description: 'Missing proper header values to access configuration database' })
  @ApiBody({ type: DownloadConfigurationRequestDto })
  @HttpCode(HttpStatus.OK)
  async sync(
    @Project() project: string,
    @ConfigId() configId: string,
    @Body('get') collections: [string],
    @Body('uptime') lastUptime: number,
  ): Promise<DownloadConfigurationResponseDto> {
    const dbName = `${project}_${configId}`;

    const data: ConfigurationSlice = await this.configService.downloadConfiguration(dbName, collections, lastUptime);

    return plainToClass(DownloadConfigurationResponseDto, {
      data: [data],
      code: HttpStatus.OK,
      message: '',
    });
  }
  /*
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
*/
}
