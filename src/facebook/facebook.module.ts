import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MemcachedModule } from '../memcached/memcached.module';

@Module({
  imports: [AuthModule, UserModule, MemcachedModule],
  providers: [FacebookService],
  controllers: [FacebookController],
})
export class FacebookModule {}
