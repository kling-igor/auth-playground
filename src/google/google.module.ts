import { Module, HttpModule } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  providers: [GoogleService],
  controllers: [GoogleController],
})
export class GoogleModule {}
