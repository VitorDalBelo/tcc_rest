import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809391 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE drivers ADD COLUMN descricao TEXT
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE drivers DROP COLUMN descricao;
            `
            );
    }

}
