import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ConfigId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.configId;
});
