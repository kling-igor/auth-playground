import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { User } from '../user/interfaces/user.interface';
import { SignedInUserDto } from './dto/signedin-user.dto';
import { SignInUserDto } from '../user/dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signIn(signInUserDto: SignInUserDto): Promise<SignedInUserDto> {
    const user: User = await this.userService.getUserByEmail(signInUserDto.email);

    if (!user) {
      throw new NotFoundException('Wrong email or password.');
    }

    const matched = await this.userService.checkPassword(signInUserDto.password, user);

    if (!matched) {
      throw new NotFoundException('Wrong email or password.');
    }

    return {
      email: user.email,
      jwt: '',
      refreshToken: '',
    };
  }
}
