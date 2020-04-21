import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { User } from '../user/user.entity';
import * as argon2 from 'argon2';

export class CreateAdminUser1587456659171 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new User();
    user.firstName = 'Igor';
    user.lastName = 'Kling';
    user.login = 'kling-igor@yandex.ru';
    user.password = await argon2.hash(process.env.ADMIN_PASSWORD);

    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
