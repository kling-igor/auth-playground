import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, OneToMany, Index } from 'typeorm';

import { UserEntity } from './user.entity';
import { SingleUseCodeEntity } from '../auth/single-use-code.entity';

@Entity({ name: 'social_networks' })
export class SocialNetworkEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ type: 'varchar', length: 20, name: 'social_name' })
  public socialName: string;

  @Index()
  @Column({ type: 'varchar', length: 255, name: 'social_id' })
  public socialId: string;

  // @ManyToOne(
  //   () => UserEntity,
  //   user => user.socialAccounts,
  // )
  // @JoinTable({
  //   name: 'users_social_accounts',
  //   joinColumn: {
  //     name: 'account_id',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'user_id',
  //     referencedColumnName: 'id',
  //   },
  // })
  @Index()
  @ManyToOne(
    () => UserEntity,
    user => user.socialAccounts,
  )
  public user: UserEntity;

  @OneToMany(
    () => SingleUseCodeEntity,
    singleUseCode => singleUseCode.socialAccount,
    { eager: true, cascade: true },
  )
  public singleUseCodes: SingleUseCodeEntity[];
}

// CREATE TABLE social_networks
// (
// user_id integer NOT NULL,
// social_name character varying(25) NOT NULL,
// social_id character varying(50) NOT NULL,
// CONSTRAINT social_networks_pkey PRIMARY KEY (user_id, social_name),
// CONSTRAINT user_fk FOREIGN KEY (user_id)
// REFERENCES users (id) MATCH FULL
// ON UPDATE CASCADE ON DELETE CASCADE
// )
