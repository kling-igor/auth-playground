import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';

import axios, { AxiosResponse } from 'axios';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';

import { UserData, InsufficientCredentialsError } from '../common/social';

const NETWORK_NAME = 'facebook';

@Injectable()
export class FacebookService {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async getProfile(accessToken: string): Promise<any> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const fields = encodeURIComponent('id,email,first_name,last_name,middle_name');

    try {
      const response: AxiosResponse = await axios.get(
        `https://graph.facebook.com/me?fields=${fields}&client_id=${appId}&client_secret=${appSecret}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const { data } = response;

      return data;
    } catch (e) {
      throw new BadRequestException('Invalid Facebook access token');
    }
  }

  async signUp(accessToken: string, userData: UserData): Promise<SignInUserResponseDto> {
    let profile;

    try {
      profile = await this.getProfile(accessToken);
    } catch (e) {
      throw new BadRequestException('Invalid Facebook access token');
    }

    const { id, email, first_name: firstName, last_name: lastName, middle_name: middleName } = profile;

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, id);

    if (user) {
      throw new ConflictException(`User with Facebook account ${id} already exists`);
    }

    return await this.authService.signUpWithSocial({
      login: email || userData.login,
      // eslint-disable-next-line @typescript-eslint/camelcase
      firstName: firstName || userData.first_name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      lastName: lastName || userData.last_name,
      socialNetwork: NETWORK_NAME,
      socialId: id,
    });
  }

  async signIn(accessToken: string): Promise<SignInUserResponseDto> {
    let profile;

    try {
      profile = await this.getProfile(accessToken);
    } catch (e) {
      throw new BadRequestException('Invalid Facebook access token');
    }

    const { id, email, first_name: firstName, last_name: lastName, middle_name: middleName } = profile;

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, id);

    if (!user) {
      if (!email) {
        // unable to create account without email
        throw new InsufficientCredentialsError(firstName, lastName);
      }

      return await this.authService.signUpWithSocial({
        login: email,
        firstName,
        lastName,
        socialNetwork: NETWORK_NAME,
        socialId: id,
      });
    }

    return await this.authService.issueNewToken(user);
  }

  async linkAccountToUser(accessToken: string, userId: string) {
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
