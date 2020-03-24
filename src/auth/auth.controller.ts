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
import { SignInUserDto, SignUpUserDto } from './dto';
import { SignedInUserDto } from './dto/signedin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() signUpUserDto: SignUpUserDto): Promise<SignedInUserDto> {
    return this.authService.signUp(signUpUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<SignedInUserDto> {
    return this.authService.signIn(signInUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('email') email: string, @Body('refreshToken') refreshToken: string): Promise<SignedInUserDto> {
    return this.authService.refresh(email, refreshToken);
  }
}
