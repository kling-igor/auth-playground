import {
  Injectable,
  HttpService,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';
import { differenceInSeconds } from 'date-fns';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';
import { MemcachedService } from '../memcached/memcached.service';

const GOOGLE_AUTH_CLIENT_ID = '582340154298';

@Injectable()
export class GoogleService {
  constructor(
    private readonly http: HttpService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly memcachedService: MemcachedService,
  ) {}

  private async getCert(): Promise<string> {
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

    return cert;
  }

  private async decodeToken(userToken: string): Promise<any> {
    const cert = await this.getCert();

    try {
      return jwt.verify(userToken, cert, { algorithms: ['RS256'], ignoreExpiration: false });
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Invalid Google token (expired)');
      }

      throw new BadRequestException('Invalid Google token');
    }
  }

  async signUp(userToken: string): Promise<SignInUserResponseDto> {
    const {
      sub,
      aud,
      iss,
      email,
      email_verified,
      given_name: firstName,
      family_name: lastName,
    } = await this.decodeToken(userToken);
    if (!iss.includes('accounts.google.com')) {
      throw new BadRequestException(`Invalid Google token (invalid issuer)`);
    }

    if (!sub) {
      throw new BadRequestException(`Invalid Google token (no subject found)`);
    }

    if (!aud.startsWith(GOOGLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Google token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount('google', sub);

    if (user) {
      throw new ConflictException(`User with Google account ${sub} already exists`);
    }

    // если email проверен то создаем новый аккаунт с пустым паролем
    // создаем социальный аккаунт и привязываем

    // если нет, то редирект (нужно выбросит исключение? - как и где перехватить?)

    const authenticatedUser = await this.authService.signUp({
      login: email,
      password: '',
      firstName,
      lastName,
    });

    return authenticatedUser;
  }

  async signIn(userToken: string): Promise<SignInUserResponseDto> {
    const { sub, aud, iss } = await this.decodeToken(userToken);

    if (!iss.includes('accounts.google.com')) {
      throw new BadRequestException(`Invalid Google token (invalid issuer)`);
    }

    if (!sub) {
      throw new BadRequestException(`Invalid Google token (no subject found)`);
    }

    if (!aud.startsWith(GOOGLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Google token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount('google', sub);

    if (!user) {
      throw new NotFoundException(`No user with Google account ${sub} found`);
    }

    return await this.authService.issueNewToken(user);
  }
}

// FACEBOOK
// ACCESS TOKEN: EAAGxk7dGpngBAEKPDa4sQtSCjz4qEgdzBgYBau0axyL89Psrhnx2KJTjqKHlk8NNybKe5rnqeUvnJjb5UmWgZCyaXwqgxgSbZCB5aNLHpkha0mlCWmDzs8Np5WSPor0HZBtFIeJ0ZCW6pjMNzGjIO3oiSI0m8ktWI1gd3Kv4PFZBjc3UmwRZBu0yTT8r168PYZD
// USER_ID 3025672047485332

// Capitalizer Google
// https://console.developers.google.com/apis/credentials?hl=RU&project=capitalizer-1581418263422&authuser=1

// web
'582340154298-dfi9lu4837vmgs7ai651n7242o02v1u3.apps.googleusercontent.com';

// iOS
'582340154298-0rrvj4q5ptdje2mnl8co0t3d2b97s230.apps.googleusercontent.com';

// Android
'582340154298-9l39tq6m7bjo097668ujt6t0a3ajr8aj.apps.googleusercontent.com';
