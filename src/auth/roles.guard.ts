import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('USER:', user);
    // return matchRoles(roles, user.roles);

    return true;
  }

  // handleRequest(err, user, info: Error, context: ExecutionContext) {
  //   const request = context.switchToHttp().getRequest();
  //   console.log('REQUEST USER:', request.user);

  //   console.log('### USER:', user);

  //   const roles = this.reflector.get<string[]>('roles', context.getHandler());

  //   console.log('### ROLES:', roles);

  //   if (!roles) {
  //     return true;
  //   }
  //   const hasRole = () => user.roles.some(role => roles.includes(role));

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   if (!(user.roles && hasRole())) {
  //     throw new ForbiddenException('Forbidden');
  //   }

  //   return user && user.roles && hasRole();
  // }
}
