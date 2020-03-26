import {
  Controller,
  Post,
  Get,
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

import { ConfigurationService } from './config.service';

@Controller('config')
export class ConfigurationController {
  constructor(private configService: ConfigurationService) {
    console.log('CREATING CONFIG CONTROLLER');
  }

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
}
