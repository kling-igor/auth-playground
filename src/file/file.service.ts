/* eslint-disable @typescript-eslint/camelcase */
import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Model } from 'mongoose';

import { Repository } from 'typeorm';

// import { File } from './file.interface';
import { File } from './file.entity';

// import { FILE_MODEL } from './constants';

import { FileInfoCreateDto } from './dto/file-info.create.dto';
import { FileUploadResponseDto, FileUploadStatus } from './dto/file-upload.response.dto';

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
  // constructor(
  //   @Inject(FILE_MODEL)
  //   private fileModel: Model<File>,
  // ) {}

  constructor(@InjectRepository(File) private readonly fileRepository: Repository<File>) {}

  async download(filePath: string): Promise<any> {
    // TODO:  to be done
    return Promise.resolve();
  }

  async upload(files: [UploadedFile], fileInfo: [FileInfoCreateDto]): Promise<FileUploadResponseDto> {
    console.log('FILES:', files);
    console.log('FILE INFO:', fileInfo, typeof fileInfo);

    const result: Record<string, FileUploadStatus> = {};
    // const result: FileUploadStatus[] = [];

    for await (const file of files) {
      const { fieldname, filename, mimetype } = file;
      const info = fileInfo.find(item => item.id === fieldname);
      if (!info) {
        result[fieldname] = { id: fieldname, code: 400, message: 'No file content' };
        // result.push({ id: fieldname, code: 400, message: 'No file content' });
      } else {
        // performance hit!!!
        // * wrong hash - некорректный запрос - хэш файла не соответствует переданному в информации о файле

        const { hash, static: isStatic } = info;

        if (isStatic) {
          result[fieldname] = { id: fieldname, code: 200, message: 'File uploaded' };
          // result.push({ id: fieldname, code: 200, message: 'File uploaded' });
        } else {
          const previouslyUploaded = await this.fileRepository.findOne({ where: { fileHash: hash } });
          console.log('previouslyUploaded', previouslyUploaded);

          // get rid of timezone
          const uploadDate = new Date(
            new Date()
              .toISOString()
              .split('.')
              .shift(),
          );

          const newFile = this.fileRepository.create({
            fileId: fieldname,
            fileHash: hash,
            fileType: mimetype,
            filename: filename,
            userId: '123e4567-e89b-12d3-a456-426655440000', // TODO user real user info!!!
            uploadStatus: 'success',
            uploadDate: uploadDate,
            project: 'conf', // TODO: user real project
            static: false,
          });

          if (previouslyUploaded) {
            await this.fileRepository.update(previouslyUploaded.fileId, newFile);
            result[fieldname] = { id: fieldname, code: 200, message: 'Duplicate' };
          } else {
            await this.fileRepository.save(newFile);
            result[fieldname] = { id: fieldname, code: 200, message: 'File uploaded' };
          }

          /*          
          const previouslyUploaded = await this.fileModel.findOne({ file_hash: hash });

          console.log('previouslyUploaded', previouslyUploaded);

          const fileDescription = {
            file_id: fieldname,
            file_hash: hash,
            file_type: mimetype,
            filename: filename,
            user_id: '123e4567-e89b-12d3-a456-426655440000', // TODO user real user info!!!
            upload_status: 'success',
            upload_date: Date.now(),
            project: 'conf', // TODO: user real project
            static: false,
          };

          if (previouslyUploaded) {
            await this.fileModel.findByIdAndUpdate(previouslyUploaded._id, fileDescription);
            result[fieldname] = { id: fieldname, code: 200, message: 'Duplicate' };
            // result.push({ id: fieldname, code: 200, message: 'Duplicate' });
          } else {
            const uploadedFile = new this.fileModel(fileDescription);
            await uploadedFile.save();
            result[fieldname] = { id: fieldname, code: 200, message: 'File uploaded' };
            // result.push({ id: fieldname, code: 200, message: 'File uploaded' });
          }
*/
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
