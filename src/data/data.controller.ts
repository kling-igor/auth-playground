import { Controller, Post, Body, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiOkResponse } from '@nestjs/swagger';

import { DataService } from './data.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Document')
@ApiBearerAuth()
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save documents', description: 'Save documents to specified project database' })
  @ApiOkResponse({ description: 'Document saved.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  async save(
    @Headers('x-marm-token') token: string,
    @Headers('x-project-version') projectVersion: string,
    @Body('name') modelName: string,
    @Body('objects') documents: [any],
  ): Promise<[any]> {
    const project = token.split('_').shift();
    const configId = projectVersion.replace('v1d', '');
    return this.dataService.save(project, configId, modelName, documents);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('findall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch documents', description: 'Fetch documents' })
  @ApiOkResponse({ description: 'Document collection.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  async findAll(
    @Headers('x-marm-token') token: string,
    @Headers('x-project-version') projectVersion: string,
    @Body('name') modelName: string,
    @Body('name') filters: [Record<string, any>],
    @Body('name') fields: [string],
    @Body('name') sort: [Record<string, number>],
    @Body('name') limit: number,
    @Body('name') offset: number,
  ): Promise<any> {
    const project = token.split('_').shift();
    const configId = projectVersion.replace('v1d', '');
    return this.dataService.findAll(project, configId, modelName, filters, fields, sort, limit, offset);
  }
}
