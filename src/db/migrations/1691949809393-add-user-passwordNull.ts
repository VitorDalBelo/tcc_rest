import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809392 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE users ADD COLUMN google_account BOOLEAN DEFAULT FALSE;
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE users DROP COLUMN google_account;
            `
            );
    }

}
