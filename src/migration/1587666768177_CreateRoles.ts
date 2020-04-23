import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { RoleEntity } from '../user/role.entity';

export class CreateRoles1587666768177 implements MigrationInterface {
  name = 'CreateRoles1587666768177';

  public async up(queryRunner: QueryRunner): Promise<any> {
    const admin = new RoleEntity();
    admin.code = 'admin';
    const regular = new RoleEntity();
    regular.code = 'regular';
    const roleRepository = getRepository(RoleEntity);
    await roleRepository.save([admin, regular]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const userRepository = getRepository(RoleEntity);
    await userRepository.clear();
  }
}
