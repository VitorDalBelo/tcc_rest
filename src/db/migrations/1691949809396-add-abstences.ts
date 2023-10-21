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
                tripid INT,
                passengerid INT,
                FOREIGN KEY (tripid) REFERENCES trips(trip_id)
            );

            ALTER TABLE absences
            ADD CONSTRAINT fk_passengers_absences
            FOREIGN KEY (passengerid)
            REFERENCES passengers(passenger_id);
            
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE absences
            DROP CONSTRAINT fk_passengers_absences;

            DROP TABLE absences;

            `
            );
    }

}
