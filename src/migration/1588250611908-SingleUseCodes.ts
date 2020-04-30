import {MigrationInterface, QueryRunner} from "typeorm";

export class SingleUseCodes1588250611908 implements MigrationInterface {
    name = 'SingleUseCodes1588250611908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "single_use_codes" ("code" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" uuid, "socialAccountId" integer, "socialAccountSocialName" character varying(20), "socialAccountSocialId" character varying(255), CONSTRAINT "REL_6d9994b41c3afa521436b1dfa7" UNIQUE ("userId"), CONSTRAINT "REL_0b43b2ee94569958317d966fe0" UNIQUE ("socialAccountId", "socialAccountSocialName", "socialAccountSocialId"), CONSTRAINT "PK_5df5b20daaa4f3830a841a1bb4b" PRIMARY KEY ("code"))`, undefined);
        await queryRunner.query(`ALTER TABLE "single_use_codes" ADD CONSTRAINT "FK_6d9994b41c3afa521436b1dfa74" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "single_use_codes" ADD CONSTRAINT "FK_0b43b2ee94569958317d966fe0b" FOREIGN KEY ("socialAccountId", "socialAccountSocialName", "socialAccountSocialId") REFERENCES "social_networks"("id","social_name","social_id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "single_use_codes" DROP CONSTRAINT "FK_0b43b2ee94569958317d966fe0b"`, undefined);
        await queryRunner.query(`ALTER TABLE "single_use_codes" DROP CONSTRAINT "FK_6d9994b41c3afa521436b1dfa74"`, undefined);
        await queryRunner.query(`DROP TABLE "single_use_codes"`, undefined);
    }

}
