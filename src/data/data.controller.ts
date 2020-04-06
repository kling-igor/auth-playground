import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Res,
  Req,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

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

import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('save')
  @HttpCode(HttpStatus.OK)
  async save(
    @Headers('x-marm-token') token: string,
    @Body('name') modelName: string,
    @Body('objects') documents: [any],
  ): Promise<any> {
    const project = token.split('_').shift();
    return this.dataService.save(project, modelName, documents);
  }

  @Post('findall')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Headers('x-marm-token') token: string,
    @Body('name') modelName: string,
    @Body('name') filters: [Record<string, any>],
    @Body('name') fields: [string],
    @Body('name') sort: [Record<string, number>],
    @Body('name') limit: number,
    @Body('name') offset: number,
  ): Promise<any> {
    const project = token.split('_').shift();
    return this.dataService.findAll(project, modelName, filters, fields, sort, limit, offset);
  }
}
