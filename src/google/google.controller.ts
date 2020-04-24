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

import { GoogleService } from './google.service';

@Controller('social')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('google/signup')
  async signUp(@Body('tokenId') tokenId: string): Promise<SignInUserResponseDto> {
    const result = await this.googleService.signUp(tokenId);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('google/signin')
  async signIn(@Body('tokenId') tokenId: string): Promise<SignInUserResponseDto> {
    const result = await this.googleService.signIn(tokenId);
    return plainToClass(SignInUserResponseDto, result);
  }
}
