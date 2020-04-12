import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ConfigId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const version = request.header('x-project-version');
  if (version) {
    return version.replace('v1d', '');
  }
});
