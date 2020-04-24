import { NestFactory } from '@nestjs/core';
import { Repository, getConnection } from 'typeorm';
import { AppModule } from './app.module';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { UserEntity } from './user/user.entity';
import { SocialNetworkEntity } from './user/social.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const connection = getConnection();

  const userRepository = connection.getRepository(UserEntity);
  const user = await userRepository
    .createQueryBuilder('users')
    .innerJoinAndSelect('users.socialAccounts', 'social_networks')
    .where('social_networks.socialName = :socialName', { socialName: 'google' })
    .andWhere('social_networks.socialId = :socialId', { socialId: '113872996235412047856' })
    .cache(true)
    .getOne();

  console.log('USER:', user);

  // const account = await socialRepository.findOne({
  //   where: { socialName: 'google', socialId: '113872996235412047856' },
  // });

  // const users = await userRepository
  //   .createQueryBuilder('users')
  //   .select()
  //   .leftJoinAndSelect('users.roles', 'roles')
  //   .getMany();

  // // const users = await userRepository.find({ relations: ['roles'] });

  // console.table(users, ['id', 'firstName', 'lastName', 'roles']);

  // const userService = app.select(UserModule).get(UserService, { strict: true });

  // const admin: UserEntity = await userService.getUserByLogin('kling-igor@yandex.ru');
  // console.log('ADMIN', admin);

  await app.close();
}
bootstrap().then(() => process.exit(0));
