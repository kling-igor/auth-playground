import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { SocialNetworkEntity } from '../user/social.entity';

export class LinkSocialAccount1587668085582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const googleAccount = new SocialNetworkEntity();
    googleAccount.socialName = 'google';
    googleAccount.socialId = '113872996235412047856';

    const userRepository = getRepository(UserEntity);
    const socialRepository = getRepository(SocialNetworkEntity);

    const admin = await userRepository.findOne({ where: { login: 'kling-igor@yandex.ru' } });

    googleAccount.user = admin;

    await socialRepository.save(googleAccount);
    admin.socialAccounts = [googleAccount];

    await userRepository.save(admin);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
