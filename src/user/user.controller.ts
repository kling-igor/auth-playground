import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser('userId') userId: string): Promise<any> {
    return await this.userService.getUserById(userId);
  }
}
