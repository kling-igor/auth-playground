import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

// import { User } from './interfaces/user.interface';

import { User } from './user.entity';

import { CreateUserDto } from './dto';
// import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

// const FAKE_USERS = [];

// export type CreatedUser = Partial<User>;

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const login = createUserDto.login.toLowerCase();
    const password = await argon2.hash(createUserDto.password);

    // for test purposes only
    // const role = login === 'kling-igor@yandex.ru' ? 'admin' : 'user';

    // const id = uuidv4();

    // const newUser = {
    //   id,
    //   ...createUserDto,
    //   login,
    //   password,
    //   // roles: [role],
    // };

    // FAKE_USERS.push(newUser);

    // return {
    //   id,
    //   login,
    //   firstName: createUserDto.firstName,
    //   lastName: createUserDto.lastName,
    //   // roles: [role],
    // };

    const createdAt = new Date(
      new Date()
        .toISOString()
        .split('.')
        .shift(),
    );

    // const newUser = this.userRepository.create({
    //   firstName: createUserDto.firstName,
    //   middleName: createUserDto.middleName,
    //   lastName: createUserDto.lastName,
    //   login,
    //   password,
    //   createdAt,
    //   updatedAt: createdAt,
    //   refreshToken: createUserDto.refreshToken,
    //   expirationDate: createUserDto.expirationDate,
    // } as DeepPartial<User>);

    const newUser = this.userRepository.create();
    newUser.firstName = createUserDto.firstName;
    newUser.middleName = createUserDto.middleName;
    newUser.lastName = createUserDto.lastName;
    newUser.login = login;
    newUser.password = password;
    newUser.createdAt = createdAt;
    newUser.updatedAt = createdAt;
    newUser.refreshToken = createUserDto.refreshToken;
    newUser.expirationDate = createUserDto.expirationDate;

    return await this.userRepository.save(newUser);
  }

  async updateUser(user: User): Promise<User | undefined> {
    const found: User = await this.getUserById(user.id);
    if (!found) return;

    // const allKeysExceptId = Object.keys(found).filter(key => key !== 'id');
    // for (const key of allKeysExceptId) {
    //   found[key] = user[key];
    // }

    return await this.userRepository.merge(found, user);
  }

  private async getUser(key: string, value: string): Promise<User> {
    // return FAKE_USERS.find(user => user[key] === value);
    return await this.userRepository.findOne({ where: { [key]: value } });
  }

  async getUserById(id: string): Promise<User> {
    return this.getUser('id', id);
  }

  async getUserByLogin(login: string): Promise<User> {
    return this.getUser('login', login);
  }

  async allUsers(offset = 0, limit = 10): Promise<User[]> {
    // return FAKE_USERS.slice(offset, offset + limit);

    return await this.userRepository.find();
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    return await argon2.verify(user.password, password);
    // todo - register failed attempts count
  }

  async checkRefreshToken(refreshToken: string, user: User): Promise<boolean> {
    return await true; //argon2.verify(user.refreshToken, refreshToken);
  }
}
