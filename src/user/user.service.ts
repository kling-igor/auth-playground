import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from './user.entity';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const login = createUserDto.login.toLowerCase();
    const password = await argon2.hash(createUserDto.password);

    // for test purposes only
    // const role = login === 'kling-igor@yandex.ru' ? 'admin' : 'user';

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

  async updateUser(user: Partial<User>): Promise<boolean> {
    const found: User = await this.getUserById(user.id);
    if (!found) return;

    const { affected } = await this.userRepository.update(found.id, user);
    return affected === 1;
  }

  private async getUser(key: string, value: string): Promise<User> {
    return await this.userRepository.findOne({ where: { [key]: value } });
  }

  async getUserById(id: string): Promise<User> {
    return this.getUser('id', id);
  }

  async getUserByLogin(login: string): Promise<User> {
    return this.getUser('login', login);
  }

  async allUsers(offset = 0, limit = 10): Promise<User[]> {
    return await this.userRepository.find();
  }
}
