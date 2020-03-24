import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

const FAKE_USERS = [];

export type CreatedUser = Partial<User>;

@Injectable()
export class UserService {
  async createUser(userDto: CreateUserDto): Promise<CreatedUser> {
    const email = userDto.email.toLowerCase();
    const password = await argon2.hash(userDto.password);

    // for test purposes only
    const role = email === 'kling-igor@yandex.ru' ? 'admin' : 'user';

    const id = uuidv4();

    const newUser = {
      id,
      ...userDto,
      email,
      password,
      roles: [role],
    };

    FAKE_USERS.push(newUser);

    return {
      id,
      email,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      roles: [role],
    };
  }

  async updateUser(user: User): Promise<boolean> {
    const found = this.getUserById(user.id);
    if (!found) return false;

    const allKeysExceptId = Object.keys(found).filter(key => key !== 'id');
    for (const key of allKeysExceptId) {
      found[key] = user[key];
    }

    return true;
  }

  private async getUser(key: string, value: string): Promise<User> {
    return FAKE_USERS.find(user => user[key] === value);
  }

  async getUserById(id: string): Promise<User> {
    return this.getUser('id', id);
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.getUser('email', email);
  }

  async allUsers(offset = 0, limit = 10): Promise<User[]> {
    return FAKE_USERS.slice(offset, offset + limit);
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    return await argon2.verify(user.password, password);
    // todo - register failed attempts count
  }

  async checkRefreshToken(refreshToken: string, user: User): Promise<boolean> {
    return await argon2.verify(user.refreshToken, refreshToken);
  }
}
