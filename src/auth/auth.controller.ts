import {
  // ValidationPipe,
  UseGuards,
  UsePipes,
  Controller,
  Get,
  Res,
  HttpStatus,
  HttpCode,
  Param,
  NotFoundException,
  Post,
  Body,
  Query,
  Put,
  Delete,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignInUserDto } from '../user/dto/signin-user.dto';
import { SignedInUserDto } from './dto/signedin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<SignedInUserDto> {
    return this.authService.signIn(signInUserDto);
  }
}
