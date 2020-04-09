import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFiles } from '@nestjs/common';

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

// import { v4 as uuidv4 } from 'uuid';

import { FileInfoCreateDto } from './dto/file-info.create.dto';
import { FileUploadResponseDto } from './dto/file-upload.response.dto';
import { FileService } from './file.service';
import { multerOptions } from './multer.options';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @Post('put')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Upload files' })
  @ApiOkResponse({ type: [FileUploadResponseDto] })
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
