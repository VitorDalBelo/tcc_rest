import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE accesstokens (
                token TEXT NOT NULL UNIQUE,
                user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE 
            ); `
            )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.dropTable("accesstokens")
    }

}
