import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse, ApiOkResponse } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './interfaces/user.interface';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Profile received.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser('userId') userId: string): Promise<Partial<User>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, password, refreshToken, expirationDate, ...rest } = await this.userService.getUserById(userId);
    return rest;
  }
}
