import {
  Injectable,
  HttpService,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { differenceInSeconds } from 'date-fns';
import axios, { AxiosResponse } from 'axios';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';
import { MemcachedService } from '../memcached/memcached.service';

import { UserData, InsufficientCredentialsError } from '../common/social';

const NETWORK_NAME = 'google';

@Injectable()
export class GoogleService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly memcachedService: MemcachedService,
  ) {}

  private async getCert(kid: string): Promise<string> {
    let certs = await this.memcachedService.get('google_cert');

    if (!certs) {
      try {
        const response: AxiosResponse = await axios.get('https://www.googleapis.com/oauth2/v1/certs');

        const { data, headers } = response;

        const expirationDate = new Date(headers['expires']);

        certs = data;

        const seconds = differenceInSeconds(expirationDate, new Date());

        console.log(`Store Google PEM in memached for ${seconds} seconds`);
        await this.memcachedService.set('google_cert', certs, seconds);
      } catch (e) {
        throw new InternalServerErrorException('Unable to fetch Google PEM');
      }
    }

    return certs[kid];
  }

  private async decodeToken(userToken: string): Promise<any> {
    const {
      header: { kid },
    } = jwt.decode(userToken, { complete: true }) as any;

    const cert = await this.getCert(kid);

    try {
      return jwt.verify(userToken, cert, { algorithms: ['RS256'], ignoreExpiration: false });
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Invalid Google token (expired)');
      }

      throw new BadRequestException('Invalid Google token');
    }
  }

  async signUp(userToken: string, userData: UserData): Promise<SignInUserResponseDto> {
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

    if (!aud.startsWith(process.env.GOOGLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Google token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, sub);

    if (user) {
      throw new ConflictException(`User with Google account ${sub} already exists`);
    }

    // если email проверен то создаем новый аккаунт с пустым паролем
    // создаем социальный аккаунт и привязываем

    // если нет, то редирект (нужно выбросит исключение? - как и где перехватить?)

    return await this.authService.signUpWithSocial({
      login: email || userData.login,
      // eslint-disable-next-line @typescript-eslint/camelcase
      firstName: firstName || userData.first_name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      lastName: lastName || userData.last_name,
      socialNetwork: NETWORK_NAME,
      socialId: sub,
    });
  }

  async signIn(userToken: string): Promise<SignInUserResponseDto> {
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

    if (!aud.startsWith(process.env.GOOGLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Google token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, sub);

    if (!user) {
      if (!email) {
        // unable to create account without email
        throw new InsufficientCredentialsError(firstName, lastName);
      }

      // check for google profile data to create user account
      // throw new NotFoundException(`No user with Google account ${sub} found`);

      return await this.authService.signUpWithSocial({
        login: email,
        firstName,
        lastName,
        socialNetwork: NETWORK_NAME,
        socialId: sub,
      });
    }

    return await this.authService.issueNewToken(user);
  }

  async linkAccountToUser(userToken: string, userId: string) {
    // find user and social accounts
    // if user does not exist - 404
    // if social account exists - 409
    // link otherwise
  }

  async unlinkAccountFromUser(userId: string) {
    // find user and social accounts
    // if not found - 404
    // remove social account otherwise
  }
}
