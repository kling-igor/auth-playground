import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as bodyParser from 'body-parser';
import * as requestIp from 'request-ip';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(helmet());
  app.use(compression());
  app.use(hpp());
  app.enableCors();
  // use body parser so we can grab information from POST requests
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  // parse application/json
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(requestIp.mw());

  const configService = app.get(ConfigService);

  const APP_ROUTE_PREFIX = configService.get<string>('APP_ROUTE_PREFIX');
  const APP_API_VERSION = configService.get<string>('APP_API_VERSION');
  const APP_PORT = configService.get<number>('APP_PORT');

  app.setGlobalPrefix(APP_ROUTE_PREFIX);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, disableErrorMessages: false }));

  const options = new DocumentBuilder()
    .addBearerAuth()
    .addBasicAuth()
    .setTitle('DBT Box')
    .setDescription('DBT projects box API implementation')
    .setVersion(`v${APP_API_VERSION}`)
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    // ignoreGlobalPrefix: true, // if enabled - test request in swagger are targeted to striped path and hance not work properly
    // include: [
    //   UserModule,
    // ],
  });

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(APP_PORT);
}
bootstrap();
