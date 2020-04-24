import { Module, HttpModule } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MemcachedModule } from '../memcached/memcached.module';

@Module({
  imports: [HttpModule, AuthModule, UserModule, MemcachedModule],
  providers: [GoogleService],
  controllers: [GoogleController],
})
export class GoogleModule {}
