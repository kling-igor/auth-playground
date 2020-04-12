import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InfoExtractMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.header('x-marm-token');
    const version = req.header('x-project-version');

    if (token) {
      const project = token.split('_').shift();
      req.project = project;

      if (version) {
        const configId = version.replace('v1d', '');
        req.configId = configId;
      }
    }

    next();
  }
}
