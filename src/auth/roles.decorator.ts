import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from './roles.guard';

// export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const Roles = (...roles: string[]) =>
  applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(RolesGuard),
    ApiUnauthorizedResponse({ description: 'Forbidden resource' }),
  );
