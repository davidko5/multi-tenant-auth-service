import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773502799007 implements MigrationInterface {
    name = 'InitialSchema1773502799007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "appId" character varying NOT NULL, "redirectUris" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6436cc6b79593760b9ef921ef12" UNIQUE ("email"), CONSTRAINT "UQ_3b81f094c8fd1fa11e8784cfe15" UNIQUE ("appId"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "clientId" integer, CONSTRAINT "UQ_0f6c11be238ad75c8bd2bd02451" UNIQUE ("email", "clientId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_code" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "userId" integer NOT NULL, "redirectUri" character varying NOT NULL, "appId" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_79343e6f9a8993c26d9047b480b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_56f28841fe433cf13f8685f9bc1" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_56f28841fe433cf13f8685f9bc1"`);
        await queryRunner.query(`DROP TABLE "auth_code"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "client"`);
    }

}
