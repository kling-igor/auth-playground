import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('APP_ROUTE_PREFIX'));

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, disableErrorMessages: false }),
  );

  await app.listen(configService.get<number>('APP_PORT'));
}
bootstrap();
