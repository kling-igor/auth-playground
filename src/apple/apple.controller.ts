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
import { AppleSigninRequestDto } from './dto/signin-request.dto';
import { AppleSignupRequestDto } from './dto/signup-request.dto';
import { UserData, InsufficientCredentialsError } from '../common/social';

import { AppleService } from './apple.service';

@ApiTags('Auth')
@Controller('social')
export class AppleController {
  constructor(private readonly appleService: AppleService) {}

  @Post('signup/apple')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Apple provided credentials' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: AppleSignupRequestDto })
  @ApiOperation({ summary: 'Create a new user account based on Apple provided info' })
  async signUp(
    @Body('identityToken') identityToken: string,
    @Body('userData') userData: UserData,
  ): Promise<SignInUserResponseDto> {
    const result = await this.appleService.signUp(identityToken, userData);
    return plainToClass(SignInUserResponseDto, result);
  }

  @Post('signin/apple')
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Apple provided credentials' })
  @ApiNotFoundResponse({ description: 'Invalid credentials - user not found with provided Apple credentials' })
  @ApiBody({ type: AppleSigninRequestDto })
  @ApiOperation({ summary: 'Sign in user by Apple token id' })
  async signIn(@Body('identityToken') identityToken: string, @Res() res: Response) {
    try {
      const result = await this.appleService.signIn(identityToken);
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
  @Post('link/apple')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link Apple social account to existent user account' })
  async link(@Body('identityToken') identityToken: string, @CurrentUser('userId') userId: string) {
    await this.appleService.linkAccountToUser(identityToken, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unlink/apple')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink Apple social account from user account' })
  async unlink(@CurrentUser('userId') userId: string): Promise<void> {
    await this.appleService.unlinkAccountFromUser(userId);
  }
}
