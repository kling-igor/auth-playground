import {
  Injectable,
  HttpService,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';

import axios, { AxiosResponse } from 'axios';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { SignInUserResponseDto } from '../auth/dto';

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

  async signUp(accessToken: string): Promise<SignInUserResponseDto> {
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

    // // если нет, то редирект (нужно выбросит исключение? - как и где перехватить?)

    const authenticatedUser = await this.authService.signUpWithSocial({
      login: email,
      firstName,
      lastName,
      socialNetwork: NETWORK_NAME,
      socialId: id,
    });

    return authenticatedUser;
  }

  async signIn(accessToken: string): Promise<SignInUserResponseDto> {
    let profile;

    try {
      profile = await this.getProfile(accessToken);
    } catch (e) {
      throw new BadRequestException('Invalid Facebook access token');
    }

    const { id } = profile;

    const user = await this.userService.getUserBySocialAccount(NETWORK_NAME, id);

    if (!user) {
      throw new NotFoundException(`No user with Facebook account ${id} found`);
    }

    return await this.authService.issueNewToken(user);
  }
}
