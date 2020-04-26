import {
  Controller,
  Get,
  Post,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Response } from 'express';
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
import { FacebookService, MissingEmailError } from './facebook.service';

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
  async signUp(@Body('accessToken') accessToken: string, @Res() res: Response) /*: Promise<SignInUserResponseDto>*/ {
    // const result = await this.facebookService.signUp(accessToken);
    // return plainToClass(SignInUserResponseDto, result);

    try {
      const result = await this.facebookService.signUp(accessToken);
      return plainToClass(SignInUserResponseDto, result);
    } catch (e) {
      if (e instanceof MissingEmailError) {
        return res.status(313).send({
          firstName: e.firstName,
          lastName: e.lastName,
        });
      }

      throw e;
    }

    // // res.redirect(303, 'https://localhost:7777/api/v1/social/facebook/sss');
    // res.status(313).json({
    //   foo: 42,
    // });
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
