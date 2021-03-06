import {
  Controller,
  Get,
  Post,
  Delete,
  Res,
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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { plainToClass } from 'class-transformer';
import { Response } from 'express';

import { CurrentUser } from '../user/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SignInUserResponseDto } from '../auth/dto/signin-user.response.dto';
import { GoogleSigninRequestDto } from './dto/signin-request.dto';
import { GoogleSignupRequestDto } from './dto/signup-request.dto';
import { UserData, InsufficientCredentialsError } from '../common/social';

import { GoogleService } from './google.service';

@ApiTags('Auth')
@Controller('social')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('signup/google')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Google provided credentials' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: GoogleSignupRequestDto })
  @ApiOperation({ summary: 'Create a new user account based on Google provided info' })
  async signUp(@Body('tokenId') tokenId: string, @Body('userData') userData: UserData): Promise<SignInUserResponseDto> {
    const result = await this.googleService.signUp(tokenId, userData);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('signin/google')
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Google provided credentials' })
  @ApiNotFoundResponse({ description: 'Invalid credentials - user not found with provided Google credentials' })
  @ApiBody({ type: GoogleSigninRequestDto })
  @ApiOperation({ summary: 'Sign in user by Google token id' })
  async signIn(@Body('tokenId') tokenId: string, @Res() res: Response) {
    try {
      const result = await this.googleService.signIn(tokenId);
      res.status(HttpStatus.OK).json(result);
    } catch (e) {
      if (e instanceof InsufficientCredentialsError) {
        return res.status(313).send({
          email: e.email,
          firstName: e.firstName,
          lastName: e.lastName,
        });
      }

      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('link/google')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link Google social account to existent user account' })
  async link(@Body('tokenId') tokenId: string, @CurrentUser('userId') userId: string) {
    await this.googleService.linkAccountToUser(tokenId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unlink/google')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink Google social account from user account' })
  async unlink(@CurrentUser('userId') userId: string): Promise<void> {
    await this.googleService.unlinkAccountFromUser(userId);
  }
}
