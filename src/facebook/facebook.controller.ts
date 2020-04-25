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

import { SignInUserResponseDto } from '../auth/dto/signin-user.response.dto';
import { FacebookService } from './facebook.service';

@ApiTags('Auth')
@Controller('social')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('facebook/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Facebook access token' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiOperation({ summary: 'Create a new user account based on Facebook access token' })
  async signUp(@Body('accessToken') accessToken: string): Promise<SignInUserResponseDto> {
    const result = await this.facebookService.signUp(accessToken);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('facebook/signin')
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Facebook access token' })
  @ApiNotFoundResponse({ description: 'Invalid credentials - user not found with provided Facebook credentials' })
  @ApiOperation({ summary: 'Sign in user by Facebook access token' })
  async signIn(@Body('accessToken') accessToken: string): Promise<SignInUserResponseDto> {
    const result = await this.facebookService.signIn(accessToken);
    return plainToClass(SignInUserResponseDto, result);
  }
}
