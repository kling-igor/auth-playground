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
    const password = await argon2.hash(userDto.password);

    const newUser = {
      id: uuidv4(),
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password,
    };

    FAKE_USERS.push(newUser);

    // console.log(FAKE_USERS);

    return {
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
    };
  }

  async getUserById(id: string): Promise<User> {
    return FAKE_USERS.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User> {
    return FAKE_USERS.find(user => user.email === email);
  }

  async allUsers(offset = 0, limit = 10): Promise<User[]> {
    return FAKE_USERS.slice(offset, offset + limit);
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    return await argon2.verify(user.password, password);
    // todo - register failed attempts count
  }
}
