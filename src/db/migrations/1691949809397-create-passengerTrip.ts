import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809397 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE TABLE passengers_trips (
                passenger_trip_id serial PRIMARY KEY,
                tripid INT,
                passengerid INT,
                FOREIGN KEY (tripid) REFERENCES trips(trip_id),
                FOREIGN KEY (passengerid) REFERENCES passengers(passenger_id)
            );
            
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DROP TABLE passengers_trips;

            `
            );
    }

}
