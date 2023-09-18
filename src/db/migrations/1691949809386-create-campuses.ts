import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809386 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE TABLE campuses (
                id serial PRIMARY KEY,
                campus VARCHAR(255),
                address_id INT REFERENCES addresses(id) ON DELETE CASCADE NOT NULL 
            );            
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.dropTable("campuses")
    }

}
