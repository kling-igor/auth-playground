import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RoleEntity } from '../user/role.entity';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

const timestamp = (date: Date = new Date()) =>
  new Date(
    date
      .toISOString()
      .split('.')
      .shift(),
  );

export class CreateAdminUser1587537050168 implements MigrationInterface {
  name = 'CreateAdminUser1587537050168';

  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new UserEntity();
    user.firstName = 'Igor';
    user.lastName = 'Kling';
    user.login = 'kling-igor@yandex.ru';
    user.password = await argon2.hash(process.env.ADMIN_PASSWORD);
    user.refreshToken = await argon2.hash(uuidv4().replace(/\-/g, ''));
    user.expirationDate = timestamp(addDays(new Date(), 30));
    user.createdAt = timestamp();
    user.updatedAt = timestamp();

    const roleRepository = getRepository(RoleEntity);
    const adminRole = await roleRepository.findOne({ where: { code: 'admin' } });
    user.roles = [adminRole];
    const userRepository = getRepository(UserEntity);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const userRepository = getRepository(UserEntity);
    await userRepository.delete({ login: 'kling-igor@yandex.ru' });
  }
}
