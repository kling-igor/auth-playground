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
// import { User } from './interfaces/user.interface';
import { User } from './user.entity';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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
    const { id, password, /*refreshToken, expirationDate,*/ ...rest } = await this.userService.getUserById(userId);
    return rest;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Profiles received.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @ApiForbiddenResponse({ description: 'Operation not permitted' })
  @ApiOperation({ summary: 'Get users profiles' })
  async getAll(@Query('offset') offset = 0, @Query('limit') limit = 10): Promise<Partial<User>[]> {
    const users = await this.userService.allUsers(offset, limit);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ id, password, /*refreshToken, expirationDate,*/ ...rest }) => rest);
  }
}
