import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class FileService {
  async download(filePath: string): Promise<any> {
    return Promise.resolve();
  }

  async upload(files: [any], fileInfo: any): Promise<any> {
    return files.map(({ originalname, filename }) => ({ originalname, filename }));
  }
}
