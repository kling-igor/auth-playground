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
import { FacebookSigninRequestDto } from './dto/signin-request.dto';
import { FacebookSignupRequestDto } from './dto/signup-request.dto';
import { UserData, MissingEmailError } from '../common/social';

import { FacebookService } from './facebook.service';

@ApiTags('Auth')
@Controller('social')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('signup/facebook')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Facebook access token' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: FacebookSignupRequestDto })
  @ApiOperation({ summary: 'Create a new user account based on Facebook access token' })
  async signUp(@Body('accessToken') accessToken: string, @Body('userData') userData: UserData, @Res() res: Response) {
    try {
      const result = await this.facebookService.signUp(accessToken, userData);
      res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      if (e instanceof MissingEmailError) {
        return res.status(313).send({
          firstName: e.firstName,
          lastName: e.lastName,
        });
      }

      throw e;
    }
  }

  @Post('signin/facebook')
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Facebook access token' })
  @ApiNotFoundResponse({ description: 'Invalid credentials - user not found with provided Facebook credentials' })
  @ApiBody({ type: FacebookSigninRequestDto })
  @ApiOperation({ summary: 'Sign in user by Facebook access token' })
  async signIn(@Body('accessToken') accessToken: string): Promise<SignInUserResponseDto> {
    const result = await this.facebookService.signIn(accessToken);
    return plainToClass(SignInUserResponseDto, result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link/facebook')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link Facebook social account to existent user account' })
  async link(@Body('accessToken') accessToken: string, @CurrentUser('userId') userId: string) {
    await this.facebookService.linkAccountToUser(accessToken, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unlink/facebook')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink Facebook social account from user account' })
  async unlink(@CurrentUser('userId') userId: string): Promise<void> {
    await this.facebookService.unlinkAccountFromUser(userId);
  }
}
