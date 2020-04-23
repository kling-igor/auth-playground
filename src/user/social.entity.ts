import { PrimaryColumn, PrimaryGeneratedColumn, JoinTable, Entity, ManyToOne, Index } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity({ name: 'social_networks' })
export class SocialNetworkEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @PrimaryColumn({ type: 'varchar', length: 20, name: 'social_name' })
  public socialName: string;

  @PrimaryColumn({ type: 'varchar', length: 255, name: 'social_id' })
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
