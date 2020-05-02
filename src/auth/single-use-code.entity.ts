import { PrimaryGeneratedColumn, Entity, CreateDateColumn, JoinColumn, OneToOne, Column, ManyToOne } from 'typeorm';
import { Type } from 'class-transformer';

import { SocialNetworkEntity } from '../user/social.entity';

@Entity({ name: 'single_use_codes' })
export class SingleUseCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  public code: string;

  // @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', name: 'expired_at' })
  // public expirationDate: Date;

  @Column({
    name: 'expiration_date',
    type: 'int',
    width: 11,
    nullable: false,
    readonly: true,
    default: () => '0',
    transformer: {
      to: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000)),
      from: (value?: number) => (!value ? value : new Date(value * 1000)),
    },
  })
  @Type(() => Date)
  expirationDate: Date;

  @ManyToOne(
    () => SocialNetworkEntity,
    socialAccount => socialAccount.singleUseCodes,
  )
  public socialAccount: SocialNetworkEntity;
}
