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

import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { plainToClass } from 'class-transformer';

import { SignInUserResponseDto } from '../auth/dto/signin-user.response.dto';
import { GoogleService } from './google.service';

@ApiTags('Auth')
@Controller('social')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('google/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Google provided credentials' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiOperation({ summary: 'Create a new user account based on Google provided info' })
  async signUp(@Body('tokenId') tokenId: string): Promise<SignInUserResponseDto> {
    const result = await this.googleService.signUp(tokenId);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('google/signin')
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Google provided credentials' })
  @ApiNotFoundResponse({ description: 'Invalid credentials - user not found with provided Google credentials' })
  @ApiOperation({ summary: 'Sign in user by Google token id' })
  async signIn(@Body('tokenId') tokenId: string): Promise<SignInUserResponseDto> {
    const result = await this.googleService.signIn(tokenId);
    return plainToClass(SignInUserResponseDto, result);
  }
}
