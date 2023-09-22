import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809387 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE public.users ADD phone VARCHAR(15);
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE users DROP COLUMN phone;
            `
            );
    }

}
