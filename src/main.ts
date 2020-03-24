import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('APP_ROUTE_PREFIX'));

  app.useGlobalPipes(new ValidationPipe({ transform: true, disableErrorMessages: false }));

  const options = new DocumentBuilder()
    .addBearerAuth()
    .addBasicAuth()
    .setTitle('Auth Playground')
    .setDescription('Nest.js based auth playground')
    .setVersion(`v${configService.get<string>('APP_API_VERSION')}`)
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    // ignoreGlobalPrefix: true, // if enabled - test request in swagger are targeted to striped path and hance not work properly
    // include: [
    //   UserModule,
    // ],
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<number>('APP_PORT'));
}
bootstrap();
