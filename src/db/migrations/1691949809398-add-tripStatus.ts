import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809398 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE trips ADD COLUMN status BOOLEAN DEFAULT FALSE;
            
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE trips DROP COLUMN status;

            `
            );
    }

}
