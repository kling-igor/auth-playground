import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      // envFilePath: '.development.env',
      // ignoreEnvFile: true, // this ignores file and relies on environment variables from the runtime environment
    }),
    UserModule,
  ],
  // controllers: [],
  // providers: [],
})
export class AppModule {}
