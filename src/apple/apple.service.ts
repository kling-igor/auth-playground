/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import * as querystring from 'querystring';
import axios from 'axios';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';
import { MemcachedService } from '../memcached/memcached.service';

import { UserData, InsufficientCredentialsError } from '../common/social';

const NETWORK_NAME = 'apple';

const PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg8e6/X/nZX2YatnA7
DAz7ItwD27Q2LkjDJeodopOgxdmgCgYIKoZIzj0DAQehRANCAARPu6hRldP2NOnP
rwpnbhatfQDyuhxvj3e8N/p2hhhzWc1fYRXWUjFQm3p7I0znG/49TdTjGW+9S1d5
5aqsUXfc
-----END PRIVATE KEY-----`;
const TEAM_ID = 'R62DYZ4A77';
const CLIENT_ID = 'org.amg.capitalizer.client';
const KEY_ID = '5V6ZRMHP42';

const getClientSecret = () => {
  // sign with RSA SHA256
  const headers = {
    kid: KEY_ID,
    typ: undefined as any, // is there another way to remove type?
  };
  const claims = {
    iss: TEAM_ID,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  };

  return jwt.sign(claims, PRIVATE_KEY, {
    algorithm: 'ES256',
    header: headers,
    expiresIn: '24h',
  });
};

@Injectable()
export class AppleService {
  jwksClient;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly memcachedService: MemcachedService,
  ) {
    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
  }

  private async decodeToken(identityToken: string): Promise<any> {
    const {
      header: { kid },
    } = jwt.decode(identityToken, { complete: true }) as any;

    const publicKey: string = await new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }
        resolve(key.getPublicKey());
      });
    });

    try {
      return jwt.verify(identityToken, publicKey, { algorithms: ['RS256'], ignoreExpiration: false });
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Invalid Apple identity token (expired)');
      }

      throw new BadRequestException('Invalid Apple identity token');
    }
  }

  async signUp(identityToken: string, userData: UserData): Promise<SignInUserResponseDto> {
    const decoded = await this.decodeToken(identityToken);

    const { iss, aud, sub, email, email_verified } = decoded;

    if (!iss.includes('appleid.apple.com')) {
      throw new BadRequestException(`Invalid Apple identity token (invalid issuer)`);
    }

    if (!sub) {
      throw new BadRequestException(`Invalid Apple identity token (no subject found)`);
    }

    if (!aud.startsWith(process.env.APPLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Apple identity token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, sub);

    if (user) {
      throw new ConflictException(`User with Apple account ${sub} already exists`);
    }

    return await this.authService.signUpWithSocial({
      login: email || userData.login,
      // eslint-disable-next-line @typescript-eslint/camelcase
      firstName: userData.first_name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      lastName: userData.last_name,
      socialNetwork: NETWORK_NAME,
      socialId: sub,
    });
  }

  async appleCallback(code: string): Promise<string> {
    const clientSecret = getClientSecret();

    const requestBody = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://ssomobile.herokuapp.com/api/v1/social/signin/apple/callback',
      client_id: CLIENT_ID,
      client_secret: clientSecret,
      scope: 'name email',
    };

    try {
      const { data } = await axios.request({
        method: 'POST',
        url: 'https://appleid.apple.com/auth/token',
        data: querystring.stringify(requestBody),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, id_token } = data;
      // в этом месте ведем себя так же как если бы id_token был получен от клиента напрямую и провалидирован приватным ключом

      const { payload, header } = jwt.decode(id_token, { complete: true }) as any;

      const { email, sub, aud } = payload;
      // ищем пользователя с apple аккаунтом sub
      // если найден - создаем код и заносим в базу с коротким временем протухания (1мин)
      // возвращаем код
    } catch (e) {}
  }

  async signIn(identityToken: string): Promise<SignInUserResponseDto> {
    const decoded = await this.decodeToken(identityToken);

    const { iss, aud, sub, email, email_verified } = decoded;

    if (!iss.includes('appleid.apple.com')) {
      throw new BadRequestException(`Invalid Apple identity token (invalid issuer)`);
    }

    if (!sub) {
      throw new BadRequestException(`Invalid Apple identity token (no subject found)`);
    }

    if (!aud.startsWith(process.env.APPLE_AUTH_CLIENT_ID)) {
      throw new BadRequestException(`Invalid Apple identity token (inappropriate audience)`);
    }

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, sub);

    if (!user) {
      // force user to signup
      throw new InsufficientCredentialsError(null, null, email);
    }

    return await this.authService.issueNewToken(user);
  }

  async linkAccountToUser(identityToken: string, userId: string) {
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
