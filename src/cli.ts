import { NestFactory } from '@nestjs/core';
import { Repository, getConnection } from 'typeorm';
import { AppModule } from './app.module';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { UserEntity } from './user/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const connection = getConnection();
  const userRepository = connection.getRepository(UserEntity);
  const users = await userRepository
    .createQueryBuilder('users')
    .select()
    .leftJoinAndSelect('users.roles', 'roles')
    .getMany();

  // const users = await userRepository.find({ relations: ['roles'] });

  console.table(users, ['id', 'firstName', 'lastName', 'roles']);

  // const userService = app.select(UserModule).get(UserService, { strict: true });

  // const admin: UserEntity = await userService.getUserByLogin('kling-igor@yandex.ru');
  // console.log('ADMIN', admin);

  await app.close();
}
bootstrap().then(() => process.exit(0));
