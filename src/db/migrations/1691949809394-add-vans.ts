import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809394 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE TABLE vans (
                van_id serial PRIMARY KEY,
                van_photo text,
                license_plate varchar(255) NOT NULL,
                model varchar(255)
            );

            ALTER TABLE drivers ADD COLUMN van_id INT REFERENCES vans(van_id);
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE drivers DROP COLUMN van_id;
            DROP TABLE vans;
            `
            );
    }

}
