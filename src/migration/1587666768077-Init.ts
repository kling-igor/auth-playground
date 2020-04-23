import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1587666768077 implements MigrationInterface {
  name = 'Init1587666768077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "file_statistic" ("file_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_hash" character varying(40) NOT NULL, "file_type" character varying(100) NOT NULL, "filename" character varying(255) NOT NULL, "user_id" uuid NOT NULL, "upload_status" character varying(15) NOT NULL, "upload_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "project" character varying(50) NOT NULL, "static" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_476d952d3c3406c446e608619bb" PRIMARY KEY ("file_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "social_networks" ("id" SERIAL NOT NULL, "social_name" character varying(20) NOT NULL, "social_id" character varying(255) NOT NULL, "userId" uuid, CONSTRAINT "PK_77c104ad9d80f9004f970f737ac" PRIMARY KEY ("id", "social_name", "social_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_583a8a894a5d3e893298e721b1" ON "social_networks" ("userId") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(255) NOT NULL, "middle_name" character varying(255), "last_name" character varying(255) NOT NULL, "login" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "refresh_token" character varying(255) NOT NULL, "token_expires_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("code" character varying(255) NOT NULL, CONSTRAINT "PK_f6d54f95c31b73fb1bdd8e91d0c" PRIMARY KEY ("code"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "users_roles" ("role_code" character varying(255) NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_241018c221b4e81e63cc150376b" PRIMARY KEY ("role_code", "user_id"))`,
      undefined,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d090de2b26fcff3121a1c78cc1" ON "users_roles" ("role_code") `, undefined);
    await queryRunner.query(`CREATE INDEX "IDX_e4435209df12bc1f001e536017" ON "users_roles" ("user_id") `, undefined);
    await queryRunner.query(
      `ALTER TABLE "social_networks" ADD CONSTRAINT "FK_583a8a894a5d3e893298e721b1c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_d090de2b26fcff3121a1c78cc14" FOREIGN KEY ("role_code") REFERENCES "roles"("code") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_e4435209df12bc1f001e5360174" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_e4435209df12bc1f001e5360174"`, undefined);
    await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_d090de2b26fcff3121a1c78cc14"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "social_networks" DROP CONSTRAINT "FK_583a8a894a5d3e893298e721b1c"`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX "IDX_e4435209df12bc1f001e536017"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_d090de2b26fcff3121a1c78cc1"`, undefined);
    await queryRunner.query(`DROP TABLE "users_roles"`, undefined);
    await queryRunner.query(`DROP TABLE "roles"`, undefined);
    await queryRunner.query(`DROP TABLE "users"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_583a8a894a5d3e893298e721b1"`, undefined);
    await queryRunner.query(`DROP TABLE "social_networks"`, undefined);
    await queryRunner.query(`DROP TABLE "file_statistic"`, undefined);
  }
}
