import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1691949809381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE public.users (
                user_id SERIAL PRIMARY KEY,
                name character varying(100) NOT NULL,
                email character varying(100) NOT NULL,
                hashpassword character varying(100) NOT NULL,
                photo character varying(255) DEFAULT 'avatars/noimage.jpg'::character varying,
                profile character varying(20) DEFAULT 'user'::character varying
            );`
            )
        await queryRunner.query(
            `CREATE TABLE public.drivers (
                driver_id SERIAL PRIMARY KEY,
                cnpj character varying(20) NOT NULL,
                user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL
            );`
            )
        await queryRunner.query(
                `CREATE TABLE public.passengers (
                    passenger_id SERIAL PRIMARY KEY,
                    cpf character varying(14) NOT NULL,
                    user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL
                );`
                )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.dropTable("passengers")
           await queryRunner.dropTable("drivers")
           await queryRunner.dropTable("users")
    }

}
