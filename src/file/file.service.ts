/* eslint-disable @typescript-eslint/camelcase */
import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { File } from './file.interface';
import { FILE_MODEL } from './constants';

declare type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

declare type FileInfo = {
  id: string;
  hash: string;
  name: string;
  type: string;
  encoding: 'binary' | 'base64';
  static: boolean;
};

declare type FileUploadStatus = {
  code: number;
  message: string;
};

declare type UploadResult = {
  code: number;
  message: string;
  data: Record<string, FileUploadStatus>;
};

/*
FILES: [ { fieldname: '8b162eab-7329-4158-bfff-1d924f390c57',
    originalname: 'f5fd7a70bc7b095a4d68f43c4013bc90696ab7ce.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination:
     '/Users/kling/Projects/Altarix/auth-playground/dist/upload/blackhole/static/f/f5/fd',
    filename: 'f5fd7a70bc7b095a4d68f43c4013bc90696ab7ce.png',
    path:
     '/Users/kling/Projects/Altarix/auth-playground/dist/upload/blackhole/static/f/f5/fd/f5fd7a70bc7b095a4d68f43c4013bc90696ab7ce.png',
    size: 15339 } ]

INFO: [ { id: '8b162eab-7329-4158-bfff-1d924f390c57',
    hash: 'f5fd7a70bc7b095a4d68f43c4013bc90696ab7ce',
    name: 'logo',
    type: 'png',
    encoding: 'binary',
    static: true } ]
*/

@Injectable()
export class FileService {
  constructor(
    @Inject(FILE_MODEL)
    private fileModel: Model<File>,
  ) {}

  async download(filePath: string): Promise<any> {
    return Promise.resolve();
  }

  async upload(files: [UploadedFile], fileInfo: [FileInfo]): Promise<UploadResult> {
    // console.log('FILES:', files);
    // console.log('INFO:', fileInfo);

    const result: Record<string, FileUploadStatus> = {};

    for await (const file of files) {
      const { fieldname, filename, mimetype } = file;
      const info = fileInfo.find(item => item.id === fieldname);
      if (!info) {
        result[fieldname] = { code: 400, message: 'No file content' };
      } else {
        // performance hit!!!
        // * wrong hash - некорректный запрос - хэш файла не соответствует переданному в информации о файле

        const { hash, static: isStatic } = info;

        if (isStatic) {
          result[fieldname] = { code: 200, message: 'File uploaded' };
        } else {
          const previouslyUploaded = await this.fileModel.findOne({ file_hash: hash });

          const uploadedFile = new this.fileModel({
            file_id: fieldname,
            file_hash: hash,
            file_type: mimetype,
            filename: filename,
            user_id: 'ZERO',
            upload_status: 'success',
            upload_date: Date.now(),
            project: 'conf',
            static: false,
          });

          await uploadedFile.save();

          result[fieldname] = { code: 200, message: previouslyUploaded ? 'Duplicate' : 'File uploaded' };
        }
      }
    }

    return {
      code: 200,
      message: '',
      data: result,
    };
  }
}
