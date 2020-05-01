import {MigrationInterface, QueryRunner} from "typeorm";

export class SingleUseCodes1588314283850 implements MigrationInterface {
    name = 'SingleUseCodes1588314283850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "single_use_codes" ("code" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "socialAccountId" integer, "socialAccountSocialName" character varying(20), "socialAccountSocialId" character varying(255), CONSTRAINT "REL_0b43b2ee94569958317d966fe0" UNIQUE ("socialAccountId", "socialAccountSocialName", "socialAccountSocialId"), CONSTRAINT "PK_5df5b20daaa4f3830a841a1bb4b" PRIMARY KEY ("code"))`, undefined);
        await queryRunner.query(`ALTER TABLE "single_use_codes" ADD CONSTRAINT "FK_0b43b2ee94569958317d966fe0b" FOREIGN KEY ("socialAccountId", "socialAccountSocialName", "socialAccountSocialId") REFERENCES "social_networks"("id","social_name","social_id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "single_use_codes" DROP CONSTRAINT "FK_0b43b2ee94569958317d966fe0b"`, undefined);
        await queryRunner.query(`DROP TABLE "single_use_codes"`, undefined);
    }

}
