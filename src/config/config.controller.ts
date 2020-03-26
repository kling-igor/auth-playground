import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';

import { ConfigurationService } from './config.service';

@Controller('config')
export class ConfigurationController {
  constructor(private configService: ConfigurationService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async upload(@Body() configuration: any) {
    await this.configService.uploadConfiguration(configuration);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(@Body('get') collections: [string], @Body('uptime') lastUptime = 0) {
    const data = await this.configService.syncConfiguration(collections, lastUptime);

    return {
      data: [data],
      code: HttpStatus.OK,
      message: '',
    };
  }
}
