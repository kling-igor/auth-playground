import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { User } from '../user/interfaces/user.interface';
import { SignedInUserDto } from './dto/signedin-user.dto';
import { SignInUserDto, SignUpUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async signUp(signUpUserDto: SignUpUserDto): Promise<SignedInUserDto> {
    const found: User = await this.userService.getUserByEmail(signUpUserDto.email.toLowerCase());

    if (found) {
      throw new ConflictException(`User with email <${signUpUserDto.email}> already exists`);
    }

    const { email, id: userId } = await this.userService.createUser(signUpUserDto);

    // @see user.decorator.ts
    const jwtPayload = { userId };

    return {
      email,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken: '',
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

    const jwtPayload = { userId };

    return {
      email,
      jwt: this.jwtService.sign(jwtPayload),
      refreshToken: '',
    };
  }
}
