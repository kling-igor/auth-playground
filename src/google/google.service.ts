import {
  Injectable,
  HttpService,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';
import { differenceInSeconds } from 'date-fns';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';
import { MemcachedService } from '../memcached/memcached.service';

@Injectable()
export class GoogleService {
  constructor(
    private readonly http: HttpService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly memcachedService: MemcachedService,
  ) {}

  async signIn(userToken: string): Promise<SignInUserResponseDto> {
    let cert = await this.memcachedService.get('google_cert');

    if (!cert) {
      try {
        const { data, status, headers } = await new Promise((resolve, reject) => {
          try {
            this.http
              .get('https://www.googleapis.com/oauth2/v1/certs')
              .pipe(
                map(({ data, status, headers }) => ({ data, status, headers })),
                catchError(e => {
                  throw e;
                }),
              )
              .subscribe(resolve);
          } catch (e) {
            reject(e);
          }
        });

        const expirationDate = new Date(headers['expires']);

        cert = Object.values(data)[0];

        const seconds = differenceInSeconds(expirationDate, new Date());

        console.log(`Store Google PEM in memached for ${seconds} seconds`);
        await this.memcachedService.set('google_cert', cert, seconds);
      } catch (e) {
        throw new InternalServerErrorException('Unable to fetch Google PEM');
      }
    }

    console.log(cert);

    let decoded;

    const audience = '582340154298-0rrvj4q5ptdje2mnl8co0t3d2b97s230.apps.googleusercontent.com';
    const issuer = 'https://accounts.google.com';
    try {
      decoded = jwt.verify(userToken, cert, { issuer, audience, algorithms: ['RS256'], ignoreExpiration: false });
    } catch (e) {
      console.log(e);

      throw new BadRequestException('Invalid Google token');
    }

    const { /*iss, aud, */ sub /*email, email_verified, given_name, family_name*/ } = decoded;

    console.table(decoded);

    if (!sub) {
      throw new BadRequestException(`Invalid Google token (no subject found)`);
    }

    const user = await this.userService.getUserBySocialAccount('google', sub);

    if (!user) {
      throw new NotFoundException(`No user with Google account ${sub} found`);
    }

    return await this.authService.issueNewToken(user);
  }
}
