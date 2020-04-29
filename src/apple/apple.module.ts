import { Module } from '@nestjs/common';
import { AppleService } from './apple.service';
import { AppleController } from './apple.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MemcachedModule } from '../memcached/memcached.module';

@Module({
  imports: [AuthModule, UserModule, MemcachedModule],
  providers: [AppleService],
  controllers: [AppleController],
})
export class AppleModule {}
