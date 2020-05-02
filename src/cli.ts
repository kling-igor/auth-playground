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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const connection = getConnection();

  const userRepository = connection.getRepository(UserEntity);

  const socialRepository = connection.getRepository(SocialNetworkEntity);

  const singleUseCodesRepository = connection.getRepository(SingleUseCodeEntity);

  // const socialAccount = await socialRepository
  //   .createQueryBuilder('social_networks')
  //   .innerJoinAndSelect('social_networks.user', 'users')
  //   .where('social_networks.socialName = :socialName', { socialName: 'google' })
  //   .andWhere('social_networks.socialId = :socialId', { socialId: '113872996235412047856' })
  //   .getOne();

  // console.log('SOCIAL ACC:', socialAccount);

  // const user = await userRepository
  //   .createQueryBuilder('users')
  //   .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
  //   .getOne();

  // console.table(user);

  // const socialAccounts = await socialRepository
  //   .createQueryBuilder('social_networks')
  //   .innerJoinAndSelect('social_networks.user', 'users')
  //   .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
  //   .getMany();

  // console.table(socialAccounts);

  const googleAccount = await socialRepository
    .createQueryBuilder('social_networks')
    .innerJoinAndSelect('social_networks.user', 'users')
    .where('users.login = :login', { login: 'kling-igor@yandex.ru' })
    .andWhere('social_networks.socialName = :socialName', { socialName: 'google' })
    .getOne();

  // console.table(googleAccount);
  // console.log(googleAccount);

  // ************
  const now = new Date();
  const expDate = addMinutes(now, 60);
  console.log('NOW:', now, ' | ', now.toUTCString());
  console.log('EXP:', expDate, ' | ', expDate.toUTCString());

  const singleUseCode = new SingleUseCodeEntity();
  singleUseCode.expirationDate = expDate;
  singleUseCode.socialAccount = googleAccount;
  await singleUseCodesRepository.save(singleUseCode);
  // ************

  /*
  const record = await singleUseCodesRepository
    .createQueryBuilder('single_use_codes')
    .innerJoinAndSelect('single_use_codes.socialAccount', 'social')
    .where('single_use_codes.code = :code', { code: '95c215c2593e4a629239a6bf9ec5a7eb' })
    .getOne();

  console.log(record);
  const {
    socialAccount: { socialName, socialId },
  } = record;

  const user = await userRepository
    .createQueryBuilder('users')
    .innerJoinAndSelect('users.socialAccounts', 'social_networks')
    .where('social_networks.socialName = :socialName', { socialName })
    .andWhere('social_networks.socialId = :socialId', { socialId })
    .cache(true)
    .getOne();

  console.log(user);
*/
  /*
  const now = new Date().toISOString();

  const { affected: count } = await singleUseCodesRepository
    .createQueryBuilder('single_use_codes')
    .delete()
    .where('single_use_codes.expired_at <= :now', { now })
    .execute();

  console.log('DELETED:', count);
*/
  const records = await singleUseCodesRepository
    .createQueryBuilder('single_use_codes')
    .select('single_use_codes')
    .getMany();

  const trans = records.map(({ expirationDate, ...rest }) => ({
    ...rest,
    expirationDate,
    expired: now > expirationDate,
  }));

  console.table(trans);

  // const now = new Date();
  // const expDate = addMinutes(now, 60);
  // console.log('NOW:', now, timestamp(now));
  // console.log('EXP:', expDate, timestamp(expDate));

  // const record = await singleUseCodesRepository
  //   .createQueryBuilder('single_use_codes')
  //   .innerJoinAndSelect('single_use_codes.user', 'user')
  //   .innerJoinAndSelect('single_use_codes.socialAccount', 'social')
  //   .where('single_use_codes.code = :code', { code: 'b2baaaf1cc3047199b380ea54d370062' })
  //   .cache(true)
  //   .getOne();

  // console.log(record);

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
