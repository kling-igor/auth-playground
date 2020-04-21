import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addMinutes, compareAsc } from 'date-fns';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
// import { User } from '../user/interfaces/user.interface';

import { User } from '../user/user.entity';

import { SignInUserResponseDto } from './dto/signin-user.response.dto';
import { SignInUserRequestDto, SignUpUserRequestDto } from './dto';

const REFRESH_EXPIRES_IN_DAYS = parseInt(process.env.REFRESH_EXPIRES_IN_DAYS || '');
const makeRefreshToken = () => uuidv4().replace(/\-/g, '');
const hash = async (str: string) => await argon2.hash(str);

const expirationDate = () =>
  new Date(
    addMinutes(Date.now(), REFRESH_EXPIRES_IN_DAYS)
      .toISOString()
      .split('.')
      .shift(),
  );

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async signUp(signUpUserDto: SignUpUserRequestDto): Promise<SignInUserResponseDto> {
    const found: User = await this.userService.getUserByLogin(signUpUserDto.login.toLowerCase());

    if (found) {
      throw new ConflictException(`User with login <${signUpUserDto.login}> already exists`);
    }

    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    const { login, id: userId /*roles = []*/ } = await this.userService.createUser({
      ...signUpUserDto,
      refreshToken: tokenHash,
      expirationDate: expirationDate(),
    });

    // @see user.decorator.ts
    const jwtPayload = { userId, roles: [] };

    return {
      login,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken,
    };
  }

  async signIn(signInUserDto: SignInUserRequestDto): Promise<SignInUserResponseDto> {
    const user: User = await this.userService.getUserByLogin(signInUserDto.login.toLowerCase());

    if (!user) {
      throw new NotFoundException('Wrong login or password.');
    }

    const matched = await this.userService.checkPassword(signInUserDto.password, user);

    if (!matched) {
      throw new NotFoundException('Wrong login or password.');
    }

    const { id: userId, login /*roles = []*/ } = user;

    // creating a new refresh token
    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    const updated = await this.userService.updateUser({
      ...user,
      refreshToken: tokenHash,
      expirationDate: expirationDate(),
    });

    if (!updated) {
      throw new BadRequestException('Unable to issue new refresh token');
    }

    const jwtPayload = { userId, roles: [] };

    return {
      login,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken,
    };
  }

  async refresh(login: string, refreshToken: string): Promise<SignInUserResponseDto> {
    const user: User = await this.userService.getUserByLogin(login);
    if (!user) {
      throw new NotFoundException(`Invalid refresh token (user with login '${login}' not found)`);
    }

    const matched = await this.userService.checkRefreshToken(refreshToken, user);

    if (!matched) {
      throw new BadRequestException('Invalid refresh token');
    }

    const { id: userId /*roles = [] */ } = user;

    // if the first date is after the second
    if (compareAsc(Date.now(), user.expirationDate) >= 0) {
      throw new UnauthorizedException('Invalid refresh token (token expired)');
    }

    // creating a new refresh token
    const newRefreshToken = makeRefreshToken();
    const tokenHash = await hash(newRefreshToken);

    const updated = await this.userService.updateUser({
      ...user,
      refreshToken: tokenHash,
      expirationDate: expirationDate(),
    });

    if (!updated) {
      throw new BadRequestException('Unable to issue new refresh token');
    }

    const jwtPayload = { userId, roles: [] };

    return {
      login,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken: newRefreshToken,
    };
  }
}
