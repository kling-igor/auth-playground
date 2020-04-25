import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Body,
} from '@nestjs/common';

import { plainToClass } from 'class-transformer';

import { SignInUserResponseDto } from '../auth/dto/signin-user.response.dto';

import { FacebookService } from './facebook.service';

@Controller('social')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('facebook/signup')
  async signUp(@Body('accessToken') accessToken: string): Promise<SignInUserResponseDto> {
    const result = await this.facebookService.signUp(accessToken);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('facebook/signin')
  async signIn(@Body('accessToken') accessToken: string): Promise<SignInUserResponseDto> {
    const result = await this.facebookService.signIn(accessToken);
    return plainToClass(SignInUserResponseDto, result);
  }
}
