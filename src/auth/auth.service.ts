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
import { User } from '../user/interfaces/user.interface';
import { SignedInUserDto } from './dto/signedin-user.dto';
import { SignInUserDto, SignUpUserDto } from './dto';

const REFRESH_EXPIRES_IN_DAYS = parseInt(process.env.REFRESH_EXPIRES_IN_DAYS || '');
const makeRefreshToken = () => uuidv4().replace(/\-/g, '');
const hash = async (str: string) => await argon2.hash(str);

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async signUp(signUpUserDto: SignUpUserDto): Promise<SignedInUserDto> {
    const found: User = await this.userService.getUserByEmail(signUpUserDto.email.toLowerCase());

    if (found) {
      throw new ConflictException(`User with email <${signUpUserDto.email}> already exists`);
    }

    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    const { email, id: userId } = await this.userService.createUser({
      ...signUpUserDto,
      refreshToken: tokenHash,
      expirationDate: addMinutes(Date.now(), REFRESH_EXPIRES_IN_DAYS),
    });

    // @see user.decorator.ts
    const jwtPayload = { userId };

    return {
      email,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken,
    };
  }

  async signIn(signInUserDto: SignInUserDto): Promise<SignedInUserDto> {
    const user: User = await this.userService.getUserByEmail(signInUserDto.email.toLowerCase());

    if (!user) {
      throw new NotFoundException('Wrong email or password.');
    }

    const matched = await this.userService.checkPassword(signInUserDto.password, user);

    if (!matched) {
      throw new NotFoundException('Wrong email or password.');
    }

    const { id: userId, email } = user;

    // creating a new refresh token
    const refreshToken = makeRefreshToken();
    const tokenHash = await hash(refreshToken);

    const updated = await this.userService.updateUser({
      ...user,
      refreshToken: tokenHash,
      expirationDate: addMinutes(Date.now(), REFRESH_EXPIRES_IN_DAYS),
    });

    if (!updated) {
      throw new BadRequestException('Unable to issue new refresh token');
    }

    const jwtPayload = { userId };

    return {
      email,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken,
    };
  }

  async refresh(email: string, refreshToken: string): Promise<SignedInUserDto> {
    const user: User = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid refresh token (user with email not found)');
    }

    const matched = await this.userService.checkRefreshToken(refreshToken, user);

    if (!matched) {
      throw new BadRequestException('Invalid refresh token');
    }

    const { id: userId, expirationDate } = user;

    // if the first date is after the second
    if (compareAsc(Date.now(), expirationDate) >= 0) {
      throw new UnauthorizedException('Invalid refresh token (token expired)');
    }

    // creating a new refresh token
    const newRefreshToken = makeRefreshToken();
    const tokenHash = await hash(newRefreshToken);

    const updated = await this.userService.updateUser({
      ...user,
      refreshToken: tokenHash,
      expirationDate: addMinutes(Date.now(), REFRESH_EXPIRES_IN_DAYS),
    });

    if (!updated) {
      throw new BadRequestException('Unable to issue new refresh token');
    }

    const jwtPayload = { userId };

    return {
      email,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken: newRefreshToken,
    };
  }
}
