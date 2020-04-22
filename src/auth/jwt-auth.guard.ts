import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
//   canActivate(context: ExecutionContext) {
//     const result = super.canActivate(context);

//     console.log('(JwtAuthGuard) canActivate', result);

//     // Add your custom authentication logic here
//     // for example, call super.logIn(request) to establish a session.
//     return result;
//   }

//   handleRequest(err, user, info, context, status) {
//     console.log('(JwtAuthGuard) handleRequest:', err, user);

//     // You can throw an exception based on either "info" or "err" arguments
//     if (err || !user) {
//       throw err || new UnauthorizedException();
//     }
//     return user;
//   }
// }
