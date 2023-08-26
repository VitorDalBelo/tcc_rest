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
                profile character varying(20) DEFAULT 'driver'::character varying,
                driver_id SERIAL PRIMARY KEY,
                cnpj character varying(20) NOT NULL,
                CONSTRAINT drivers_profile_check CHECK (((profile)::text = 'driver'::text))
            )
            INHERITS (public.users);`
            )
        await queryRunner.query(
                `CREATE TABLE public.passengers (
                    profile character varying(20) DEFAULT 'passenger'::character varying,
                    passenger_id SERIAL PRIMARY KEY,
                    cpf character varying(14) NOT NULL,
                    CONSTRAINT passengers_profile_check CHECK (((profile)::text = 'passenger'::text))
                )
                INHERITS (public.users);`
                )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
           await queryRunner.dropTable("passengers")
           await queryRunner.dropTable("drivers")
           await queryRunner.dropTable("users")
    }

}
