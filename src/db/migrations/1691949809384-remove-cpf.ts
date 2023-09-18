import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809384 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE public.passengers DROP COLUMN cpf;`
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.query(`
           ALTER TABLE public.passengers 
           ADD COLUMN cpf character varying(14) NOT NULL;
           `)
    }

}
