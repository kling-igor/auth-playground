import { createParamDecorator } from '@nestjs/common';

/**
 * Returns user (or only specified filed from user object) from request which is places there by passport
 */
export const CurrentUser = createParamDecorator((key: string, req) => {
  return key ? req.user && req.user[key] : req.user;
});
