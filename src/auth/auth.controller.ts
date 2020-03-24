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
import { SignInUserDto, SignUpUserDto } from './dto';
import { SignedInUserDto } from './dto/signedin-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Signed up successfully', type: SignedInUserDto })
  @ApiBadRequestResponse({ description: 'Missing credentials' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: SignUpUserDto })
  @ApiOperation({ summary: 'Creating a new user account' })
  async signUp(@Body() signUpUserDto: SignUpUserDto): Promise<SignedInUserDto> {
    return this.authService.signUp(signUpUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Signed in successfully', type: SignedInUserDto })
  @ApiBadRequestResponse({ description: 'Missing credentials' })
  @ApiNotFoundResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: SignInUserDto })
  @ApiOperation({ summary: 'Signing in user by email:password credentials' })
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<SignedInUserDto> {
    return this.authService.signIn(signInUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Refreshed successfully', type: SignedInUserDto })
  @ApiBadRequestResponse({ description: 'Missing email or refreshToken' })
  @ApiNotFoundResponse({ description: 'Invalid email' })
  @ApiUnauthorizedResponse({ description: 'Token expired' })
  @ApiOperation({ summary: 'Refresh user JWT/refreshToken by previously granted refresh token' })
  async refresh(@Body('email') email: string, @Body('refreshToken') refreshToken: string): Promise<SignedInUserDto> {
    return this.authService.refresh(email, refreshToken);
  }
}
