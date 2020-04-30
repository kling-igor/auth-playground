import {
  Column,
  PrimaryColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Index,
  Unique,
} from 'typeorm';

import { UserEntity } from '../user/user.entity';
import { SocialNetworkEntity } from '../user/social.entity';

@Entity({ name: 'single_use_codes' })
export class SingleUseCodeEntity {
  @PrimaryColumn({ unique: true })
  public code: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'expired_at' })
  public expirationDate: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  public user: UserEntity;

  @OneToOne(() => SocialNetworkEntity)
  @JoinColumn()
  public socialAccount: SocialNetworkEntity;
}
