import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, addSeconds } from 'date-fns';

import { UserEntity } from './user.entity';
import { SocialNetworkEntity } from './social.entity';
import { SingleUseCodeEntity } from '../auth/single-use-code.entity';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SocialNetworkEntity) private readonly socialRepository: Repository<SocialNetworkEntity>,
    @InjectRepository(SingleUseCodeEntity) private readonly singleUseCodesRepository: Repository<SingleUseCodeEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const login = createUserDto.login.toLowerCase();
    const password = await argon2.hash(createUserDto.password);

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
    // } as DeepPartial<UserEntity>);

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

  async updateUser(user: Partial<UserEntity>): Promise<boolean> {
    const found: UserEntity = await this.getUserById(user.id);
    if (!found) return;

    const { affected } = await this.userRepository.update(found.id, user);
    return affected === 1;
  }

  private async getUser(key: string, value: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { [key]: value }, relations: ['roles'] });
  }

  async getUserById(id: string): Promise<UserEntity> {
    return this.getUser('id', id);
  }

  async getUserByLogin(login: string): Promise<UserEntity> {
    return this.getUser('login', login);
  }

  async allUsers(offset = 0, limit = 10): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async getUserBySocialAccount(socialName: string, socialId: string): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('users')
      .innerJoinAndSelect('users.socialAccounts', 'social_networks')
      .where('social_networks.socialName = :socialName', { socialName })
      .andWhere('social_networks.socialId = :socialId', { socialId })
      .cache(true)
      .getOne();
  }

  async linkWithSocialAccount(user: UserEntity, socialNetwork: string, socialId: string) {
    const socialAccount = new SocialNetworkEntity();
    socialAccount.socialName = socialNetwork;
    socialAccount.socialId = socialId;
    socialAccount.user = user;

    await this.socialRepository.save(socialAccount);

    const { socialAccounts = [] } = user;
    user.socialAccounts = [...socialAccounts, socialAccount];
    await this.userRepository.save(user);
  }

  async createSingleUseCode(socialName: string, socialId: string): Promise<string> {
    const socialAccount = await this.socialRepository
      .createQueryBuilder('social_networks')
      .innerJoinAndSelect('social_networks.user', 'users')
      .where('social_networks.socialName = :socialName', { socialName })
      .andWhere('social_networks.socialId = :socialId', { socialId })
      .getOne();

    if (!socialAccount) {
      throw new NotFoundException(`No Apple account ${socialId} found`);
    }

    const expirationTime = addMinutes(new Date(), 2); // TODO: replace hardcoded value to .env

    const singleUseCode = new SingleUseCodeEntity();
    singleUseCode.expirationDate = expirationTime;
    singleUseCode.socialAccount = socialAccount;

    const { code } = await this.singleUseCodesRepository.save(singleUseCode);
    return code;
  }
}
