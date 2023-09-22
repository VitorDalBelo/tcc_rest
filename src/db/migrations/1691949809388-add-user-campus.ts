import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE passengers
            ADD COLUMN campus INT;

            ALTER TABLE passengers
            ADD CONSTRAINT fk_passengers_campus
            FOREIGN KEY (campus)
            REFERENCES campuses(id);
            `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(

            `
            ALTER TABLE passengers
            DROP CONSTRAINT fk_passengers_campus;

            ALTER TABLE passengers DROP COLUMN campus;
            `
            );
    }

}
