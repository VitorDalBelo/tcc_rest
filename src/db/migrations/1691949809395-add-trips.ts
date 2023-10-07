import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809395 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE TABLE trips (
                trip_id serial PRIMARY KEY,
                driver_id INT NOT NULL,
                name VARCHAR(255),
                FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
            );
            ALTER TABLE passengers
            ADD COLUMN trip_id INT REFERENCES trips(trip_id);
                        
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
                ALTER TABLE passengers DROP COLUMN trip_id;
                DROP TABLE trips;
            `
            );
    }

}
