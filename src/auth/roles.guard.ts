import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (!user.roles) {
      throw new ForbiddenException('Forbidden');
    }

    const hasRole = user.roles.some(role => roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
