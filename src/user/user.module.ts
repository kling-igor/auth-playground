import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';
import { SocialNetworkEntity } from './social.entity';
import { SingleUseCodeEntity } from '../auth/single-use-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, SocialNetworkEntity, SingleUseCodeEntity])],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
