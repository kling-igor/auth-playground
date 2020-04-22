import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public code: string;

  @ManyToMany(
    type => UserEntity,
    userEntity => userEntity.roles,
  )
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'role_code',
      referencedColumnName: 'code',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  public users: UserEntity[];
}
