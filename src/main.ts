import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as hpp from 'hpp';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.use(helmet());
  app.use(compression());
  app.use(hpp());
  app.enableCors();

  const configService = app.get(ConfigService);

  const APP_ROUTE_PREFIX = configService.get<string>('APP_ROUTE_PREFIX');
  const APP_API_VERSION = configService.get<string>('APP_API_VERSION');
  const APP_PORT = configService.get<number>('APP_PORT');

  app.setGlobalPrefix(APP_ROUTE_PREFIX);

  app.useGlobalPipes(new ValidationPipe({ transform: true, disableErrorMessages: false }));

  const options = new DocumentBuilder()
    .addBearerAuth()
    .addBasicAuth()
    .setTitle('Auth Playground')
    .setDescription('Nest.js based auth playground')
    .setVersion(`v${APP_API_VERSION}`)
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    // ignoreGlobalPrefix: true, // if enabled - test request in swagger are targeted to striped path and hance not work properly
    // include: [
    //   UserModule,
    // ],
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(APP_PORT);
}
bootstrap();
