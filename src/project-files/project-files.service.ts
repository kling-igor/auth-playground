import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import * as path from 'path';

import { File } from '../file/file.interface';
import { FILE_MODEL } from '../file/constants';

@Injectable()
export class ProjectFilesService {
  constructor(
    @Inject(FILE_MODEL)
    private fileModel: Model<File>,
  ) {}

  async getFilePath(project: string, fileId: string) {
    const foundFile = await this.fileModel.findOne({ file_id: fileId });
    console.log('foundFile:', foundFile);

    if (foundFile) {
      const { filename: fileName } = foundFile;
      return path.join(fileName.substring(0, 1), fileName.substring(0, 2), fileName.substring(2, 4), fileName);
    }
  }

  async getThumbnail(project: string, fileId: string, width: number, height: number) {
    console.log('CREATES THUMBNAIL:', project, fileId, width, height);

    // thumbnail/<project>/1/17/2e/<width>x<height>/filename.png
    // const info = await sharp(filepath).resize(width, height).toFile(outputPath)

    return;
  }
}
