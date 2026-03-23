import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToken1776551675200 implements MigrationInterface {
  name = 'AddRefreshToken1776551675200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "familyId" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "replacedAt" TIMESTAMP, "isRevoked" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "appId" character varying NOT NULL, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
