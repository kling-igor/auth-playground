import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as sharp from 'sharp';

import { File } from '../file/file.interface';
import { FILE_MODEL } from '../file/constants';

@Injectable()
export class ProjectFilesService {
  constructor(
    @Inject(FILE_MODEL)
    private fileModel: Model<File>,
  ) {}

  async getFilePath(fileId: string): Promise<string> {
    const foundFile = await this.fileModel.findOne({ file_id: fileId });
    if (foundFile) {
      const { filename: fileName } = foundFile;
      return path.join(fileName.substring(0, 1), fileName.substring(0, 2), fileName.substring(2, 4), fileName);
    }
  }

  async getThumbnailPath(fileId: string, width: string, height: string): Promise<string> {
    const foundFile = await this.fileModel.findOne({ file_id: fileId });
    if (foundFile) {
      const { filename: fileName } = foundFile;
      return path.join(
        fileName.substring(0, 1),
        fileName.substring(0, 2),
        fileName.substring(2, 4),
        `${width}x${height}`,
        fileName,
      );
    }
  }

  async createThumbnail(sourceFilePath: string, targetFilePath: string, width: number, height: number): Promise<void> {
    await fs.ensureDir(path.dirname(targetFilePath));

    await sharp(sourceFilePath)
      .resize(width, height, {
        kernel: sharp.kernel.nearest,
        fit: 'fill',
      })
      .toFile(targetFilePath);
  }
}
