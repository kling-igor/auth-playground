import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './interfaces/user.interface';
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser('userId') userId: string): Promise<Partial<User>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, id, ...rest } = await this.userService.getUserById(userId);
    return rest;
  }
}
