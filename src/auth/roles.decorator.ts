import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
export const Roles = (...roles: string[]) =>
  applyDecorators(SetMetadata('roles', roles), ApiUnauthorizedResponse({ description: 'Forbidden resource' }));
