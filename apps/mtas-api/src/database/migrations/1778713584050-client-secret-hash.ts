import { MigrationInterface, QueryRunner } from "typeorm";

export class ClientSecretHash1778713584050 implements MigrationInterface {
    name = 'ClientSecretHash1778713584050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client" ADD "secretHash" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "secretHash"`);
    }

}
