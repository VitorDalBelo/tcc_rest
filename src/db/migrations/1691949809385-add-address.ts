import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809385 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE public.passengers
            ADD COLUMN address_id INT NOT NULL REFERENCES Addresses(id) ON DELETE CASCADE NOT NULL ;
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.query(
            `
            ALTER TABLE public.passengers
            DROP COLUMN address_id;
            `
            )
    }

}
