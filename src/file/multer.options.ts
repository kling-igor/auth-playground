import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { Request } from 'express';

const imageFileFilter = (req: Request, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|docx|xlsx)$/)) {
    return callback(new Error('Only image (jpg, png, gif) or document (docx, xlsx) files are allowed!'), false);
  }
  callback(null, true);
};

const convertFileName = (req: Request, file, callback) => {
  callback(null, file.originalname);
};

const destination = (req, file, callback) => {
  const token: string = req.header('x-marm-token') as string;
  if (!token) {
    console.log('MISSING X-MARM-TOKEN');
    callback(new Error('MISSING X-MARM-TOKEN'));
  }

  const project = token.split('_')[0];

  let { filesDescriptions } = req;

  if (!filesDescriptions) {
    const { fileInfo = '[]' } = req.body;
    filesDescriptions = JSON.parse(fileInfo);
    req.filesDescriptions = filesDescriptions;
  }

  const fileDesc = filesDescriptions.find(item => item.id === file.fieldname);
  // if files specified as static - it saved to static folder inside project folder
  const staticPath = fileDesc && fileDesc.static ? 'static' : '';

  const { originalname: fileName } = file;

  const projectFilesPath = path.resolve(
    path.dirname(require.main.filename),
    process.env.STATIC_FILES_PATH,
    project,
    staticPath,
    // make directory structure based on first letters of file name, e.g. /f/fd/f5 for filename ffdf5xxxxxxxxxxxxxxx.png
    fileName.substring(0, 1),
    fileName.substring(0, 2),
    fileName.substring(2, 4),
  );

  if (!existsSync(projectFilesPath)) {
    mkdirSync(projectFilesPath, { recursive: true });
  }

  callback(null, projectFilesPath);
};

export const multerOptions = {
  storage: diskStorage({
    destination,
    filename: convertFileName,
  }),
  limits: {
    fileSize: 5 << 20, // 5 Megabytes
  },
  fileFilter: imageFileFilter,
};
