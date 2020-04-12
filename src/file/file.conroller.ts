import {
  Controller,
  UseGuards,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import { AnyFilesInterceptor } from '@nestjs/platform-express';
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

import { plainToClass } from 'class-transformer';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// import { v4 as uuidv4 } from 'uuid';

import { FileInfoCreateDto } from './dto/file-info.create.dto';
import { FileUploadResponseDto } from './dto/file-upload.response.dto';
import { FileService } from './file.service';
import { multerOptions } from './multer.options';

@ApiTags('File')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('put')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload files', description: 'Uploads files' })
  @ApiOkResponse({ type: [FileUploadResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @ApiForbiddenResponse({ description: 'Operation not permitted' })
  @ApiConsumes('multipart/form-data')
  async upload(@UploadedFiles() files, @Body('fileInfo') fileInfo: string): Promise<FileUploadResponseDto> {
    const parsedFileInfo: [FileInfoCreateDto] = JSON.parse(fileInfo);
    const result = await this.fileService.upload(files, parsedFileInfo);
    return plainToClass(FileUploadResponseDto, result);
  }

  // @Get('download/:imagepath')
  // @HttpCode(HttpStatus.OK)
  // async download(@Param('imagepath') imagepath: string, @Res() res): Promise<any> {
  //   // получаем стрим и заворачиваем его в Res
  //   return this.fileService.download(imagepath);
  // }
}
