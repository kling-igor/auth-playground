import { Controller, HttpStatus, HttpCode, Post, Body } from '@nestjs/common';

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

import { AuthService } from './auth.service';
import { SignInUserRequestDto, SignUpUserRequestDto } from './dto';
import { SignInUserResponseDto } from './dto/signin-user.response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Missing credentials' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: SignUpUserRequestDto })
  @ApiOperation({ summary: 'Creating a new user account' })
  async signUp(@Body() signUpUserDto: SignUpUserRequestDto): Promise<SignInUserResponseDto> {
    return this.authService.signUp(signUpUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Signed in successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Missing credentials' })
  @ApiNotFoundResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: SignInUserRequestDto })
  @ApiOperation({ summary: 'Signing in user by email:password credentials' })
  async signIn(@Body() signInUserDto: SignInUserRequestDto): Promise<SignInUserResponseDto> {
    return this.authService.signIn(signInUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Refreshed successfully', type: SignInUserResponseDto })
  @ApiBadRequestResponse({ description: 'Missing email or refreshToken' })
  @ApiNotFoundResponse({ description: 'Invalid email' })
  @ApiUnauthorizedResponse({ description: 'Token expired' })
  @ApiOperation({ summary: 'Refresh user JWT/refreshToken by previously granted refresh token' })
  async refresh(
    @Body('email') email: string,
    @Body('refreshToken') refreshToken: string,
  ): Promise<SignInUserResponseDto> {
    return this.authService.refresh(email, refreshToken);
  }
}
