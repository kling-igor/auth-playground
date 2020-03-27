import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectFilesService {
  async getProjectFile(project: string, fileId: string) {
    console.log('GET FILE:', project, fileId);
    return;
  }

  async getProjectFileThumbnail(project: string, fileId: string, width: number, height: number) {
    console.log('CREATES THUMBNAIL:', project, fileId, width, height);

    // thumbnail/<project>/1/17/2e/<width>x<height>/filename.png
    // const info = await sharp(filepath).resize(width, height).toFile(outputPath)

    return;
  }
}
