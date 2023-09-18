import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809383 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE addresses (
                id serial PRIMARY KEY,
                bairro VARCHAR(255),
                cidade VARCHAR(255),
                complemento VARCHAR(255),
                latitude DOUBLE PRECISION,
                logradouro VARCHAR(255),
                longitude DOUBLE PRECISION,
                numero INT,
                pais VARCHAR(255),
                uf VARCHAR(2)
            ); `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.dropTable("addresses")
    }

}
