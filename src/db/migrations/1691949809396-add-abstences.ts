import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809396 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE TABLE absences (
                absence_id serial PRIMARY KEY,
                absence_date DATE NOT NULL,
                go boolean DEFAULT true,
                back boolean DEFAULT true,
                trip_id INT,
                passenger_id INT,
                FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
                FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id)
            );
            
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DROP TABLE absence;

            `
            );
    }

}
