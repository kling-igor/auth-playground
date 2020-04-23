import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UserService } from './user.service';

import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';
import { SocialNetworkEntity } from './social.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, SocialNetworkEntity])],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
