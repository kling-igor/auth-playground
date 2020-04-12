import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Project = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const token = request.header('x-marm-token');
  if (token) {
    return token.split('_').shift();
  }
});
