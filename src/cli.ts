import { NestFactory } from '@nestjs/core';
import { Repository, getConnection } from 'typeorm';
import { AppModule } from './app.module';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { UserEntity } from './user/user.entity';
import { SocialNetworkEntity } from './user/social.entity';
import { SingleUseCodeEntity } from './auth/single-use-code.entity';

import { addMinutes, addSeconds } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const timestamp = (date: Date = new Date()) =>
  new Date(
    date
      .toISOString()
      .split('.')
      .shift(),
  );

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const connection = getConnection();

  const userRepository = connection.getRepository(UserEntity);

  const socialRepository = connection.getRepository(SocialNetworkEntity);

  const singleUseCodesRepository = connection.getRepository(SingleUseCodeEntity);

  const user = await userRepository
    .createQueryBuilder('users')
    .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
    .getOne();

  console.table(user);

  const socialAccounts = await socialRepository
    .createQueryBuilder('social_networks')
    .innerJoinAndSelect('social_networks.user', 'users')
    .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
    .getMany();

  console.table(socialAccounts);

  const googleAccount = await socialRepository
    .createQueryBuilder('social_networks')
    .innerJoinAndSelect('social_networks.user', 'users')
    .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
    .andWhere('social_networks.socialName = :socialName', { socialName: 'google' })
    .getOne();

  console.table(googleAccount);
  console.log(googleAccount);

  const code = uuidv4().replace(/\-/g, '');
  console.log('CODE:', code);

  // const singleUseCode = new SingleUseCodeEntity();
  // singleUseCode.code = code;
  // singleUseCode.expirationDate = timestamp(addSeconds(new Date(), 30));
  // singleUseCode.user = user;
  // singleUseCode.socialAccount = googleAccount;
  // await singleUseCodesRepository.save(singleUseCode);

  // const record = await singleUseCodesRepository
  //   .createQueryBuilder('single_use_codes')
  //   .select()
  //   .where('single_use_codes.code = :code', { code: 'b2baaaf1cc3047199b380ea54d370062' })
  //   .getOne();

  const record = await singleUseCodesRepository
    .createQueryBuilder('single_use_codes')
    .innerJoinAndSelect('single_use_codes.user', 'user')
    .innerJoinAndSelect('single_use_codes.socialAccount', 'social')
    .where('single_use_codes.code = :code', { code: 'b2baaaf1cc3047199b380ea54d370062' })
    .cache(true)
    .getOne();

  console.log(record);

  /*
  const userRepository = connection.getRepository(UserEntity);
  const user = await userRepository
    .createQueryBuilder('users')
    .innerJoinAndSelect('users.socialAccounts', 'social_networks')
    .where('social_networks.socialName = :socialName', { socialName: 'google' })
    .andWhere('social_networks.socialId = :socialId', { socialId: '113872996235412047856' })
    .cache(true)
    .getOne();
*/
  // console.log('USER:', user);

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
