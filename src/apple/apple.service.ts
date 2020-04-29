import { Injectable, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';
import { MemcachedService } from '../memcached/memcached.service';

import { UserData, InsufficientCredentialsError } from '../common/social';

const NETWORK_NAME = 'apple';

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
