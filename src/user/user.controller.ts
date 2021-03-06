import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @ApiOkResponse({ description: 'Profile received.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser('userId') userId: string): Promise<UserResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      id,
      password,
      refreshToken,
      expirationDate,
      createdAt,
      updatedAt,
      roles = [],
      ...rest
    } = await this.userService.getUserById(userId);
    return { ...rest, roles: roles.map(({ code }) => code) };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles('admin')
  @Get('all')
  @ApiOkResponse({ description: 'Profiles received.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @ApiForbiddenResponse({ description: 'Operation not permitted' })
  @ApiOperation({ summary: 'Get users profiles' })
  async getAll(@Query('offset') offset = 0, @Query('limit') limit = 10): Promise<UserResponseDto[]> {
    const users = await this.userService.allUsers(offset, limit);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ id, password, refreshToken, expirationDate, createdAt, updatedAt, roles = [], ...rest }) => ({
      ...rest,
      roles: roles.map(({ code }) => code),
    }));
  }
}
