import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  // id файла в формате uuid
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255, name: 'first_name' })
  public firstName: string;

  @Column({ type: 'varchar', length: 255, name: 'middle_name', nullable: true })
  public middleName: string;

  @Column({ type: 'varchar', length: 255, name: 'last_name' })
  public lastName: string;

  @Column({ type: 'varchar', length: 255 })
  public login: string;

  @Column({ type: 'varchar', length: 255 })
  public password: string;

  @Column({ type: 'varchar', length: 255, name: 'refresh_token' })
  public refreshToken;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'token_expires_at' })
  public expirationDate: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  public updatedAt: Date;
}
