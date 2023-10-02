import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE public.users ALTER COLUMN hashpassword DROP NOT NULL;

            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE public.users ALTER COLUMN hashpassword SET NOT NULL;

            `
            );
    }

}
