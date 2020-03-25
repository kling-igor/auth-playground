import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { FileService } from './file.service';

const imageFileFilter = (req, file, callback) => {
  console.log('imageFileFilter:', file);
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|docx|xlsx)$/)) {
    return callback(new Error('Only image (jpg, png, gif) or document (docx, xlsx) files are allowed!'), false);
  }
  callback(null, true);
};

const convertFileName = (req, file, callback) => {
  console.log('convertFileName:', file);
  const basename = path.basename(file.originalname);
  const extension = path.extname(file.originalname);
  callback(null, `${basename}-${uuidv4()}${extension}`);
};

const destination = (req, file, callback) => {
  for (const [key, value] of Object.entries(req.headers)) {
    console.log(`${key}:${value}`);
  }

  const token = req.header('x-marm-token');
  if (!token) {
    console.log('MISSING X-MARM-TOKEN');
    callback(new Error('MISSING X-MARM-TOKEN'));
  }

  const project = token.split('_')[0];

  const projectFilesPath = path.resolve(path.dirname(require.main.filename), process.env.STATIC_FILES_PATH, project);

  if (!existsSync(projectFilesPath)) {
    mkdirSync(projectFilesPath, { recursive: true });
  }

  callback(null, projectFilesPath);
};

const multerOptions = {
  storage: diskStorage({
    destination,
    filename: convertFileName,
  }),
  limits: {
    fileSize: 2097152, //2 Megabytes
  },
  fileFilter: imageFileFilter,
};

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 20, multerOptions))
  @HttpCode(HttpStatus.OK)
  async upload(@UploadedFiles() files): Promise<any> {
    // [
    //   {
    //     fieldname: 'file',
    //     originalname: '32.png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     destination: './files',
    //     filename: '32.png-f7b7865d-76c3-43f2-baf0-81f092ee5371.png',
    //     path: 'files/32.png-f7b7865d-76c3-43f2-baf0-81f092ee5371.png',
    //     size: 3796,
    //   },
    //   {
    //     fieldname: 'file',
    //     originalname: 'logo.png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     destination: './files',
    //     filename: 'logo.png-66dcac2d-8825-45ab-81b6-11b2073455fc.png',
    //     path: 'files/logo.png-66dcac2d-8825-45ab-81b6-11b2073455fc.png',
    //     size: 58996,
    //   },
    // ];

    return this.fileService.upload(files);
  }

  // @Get('download/:imagepath')
  // @HttpCode(HttpStatus.OK)
  // async download(@Param('imagepath') imagepath: string, @Res() res): Promise<any> {
  //   // получаем стрим и заворачиваем его в Res
  //   return this.fileService.download(imagepath);
  // }
}
