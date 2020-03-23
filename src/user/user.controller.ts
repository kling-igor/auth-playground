import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getProfile(userId: string): Promise<any> {
    return await this.userService.getUserById(userId);
  }
}
