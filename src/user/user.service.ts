import { Injectable } from '@nestjs/common';
@Injectable()
export class UserService {
  async getUserById(id: string): Promise<any> {
    return {
      firstName: 'Igor',
      lastName: 'Kling',
    };
  }
}
