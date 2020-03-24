import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

const FAKE_USERS = [
  {
    id: '1',
    email: 'kling-igor@yandex.ru',
    firstName: 'Igor',
    lastName: 'Kling',
    password: 'asasasasas',
  },
  {
    id: '2',
    email: 'jd@example.com',
    firstName: 'John',
    lastName: 'Dow',
    password: 'fdfsfsfsfsf',
  },
];

export type CreatedUser = Partial<User>;

@Injectable()
export class UserService {
  async createUser(userDto: CreateUserDto): Promise<CreatedUser> {
    const newUser = {
      id: uuidv4(),
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password: userDto.password, // to be encrypted
    };

    FAKE_USERS.push(newUser);

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
    return true;
    // return await bcrypt.compare(password, user.password);
    // todo - register failed attempts count
  }
}
