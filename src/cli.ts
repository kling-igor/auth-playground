import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { UserEntity } from './user/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const userService = app.select(UserModule).get(UserService, { strict: true });

  const admin: UserEntity = await userService.getUserByLogin('kling-igor@yandex.ru');
  console.log('ADMIN', admin);

  await app.close();
}
bootstrap().then(() => process.exit(0));
