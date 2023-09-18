
import { MigrationInterface, QueryRunner , DataSource } from "typeorm"

export class Migrations2691949809381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const campuses = [
                    {
                    id:undefined,
                    campus:"Barcelona",
                    address_id: undefined
                    },
                    {
                    id:undefined,
                    campus:"Centro",
                    address_id: undefined
                    },
                    {
                    id:undefined,
                    campus:"Conceição",
                    address_id: undefined
                    }
                ]

        const address = await queryRunner.connection.createQueryBuilder().insert().into("addresses")
        .values([{
            id:undefined,
            bairro:"Barcelona",
            cidade:"São Caetano do Sul",
            complemento:null,
            latitude:-23.6246797,
            logradouro:"Avenida Goiás",
            longitude:-46.5476174,
            numero:3400,
            pais:"Brasil",
            uf:"SP"
         },
         {
            id:undefined,
            bairro:"Centro",
            cidade:"São Caetano do Sul",
            complemento:null,
            latitude:-23.60937,
            logradouro:"Rua Santo Antonio",
            longitude:-46.5736815,
            numero:50,
            pais:"Brasil",
            uf:"SP"
         },
         {
            id:undefined,
            bairro:"Santo Antônio",
            cidade:"São Caetano do Sul",
            complemento:null,
            latitude:-23.6183802,
            logradouro:"Rua Conceição",
            longitude:-46.5785358,
            numero:321,
            pais:"Brasil",
            uf:"SP"
         },
        ]
         )
         .returning("id")
         .execute()


         address.raw.forEach((element,index) => {
            campuses[index].address_id=element.id;
         });

         await queryRunner.connection.createQueryBuilder().insert().into("campuses").values(campuses).execute();

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const a = await queryRunner.query(`
        DELETE FROM addresses
        WHERE id IN (
            SELECT a.id
            FROM addresses a
            INNER JOIN campuses c ON a.id = c.address_id
            WHERE c.campus IN ('Barcelona', 'Centro', 'Conceição')
        );

        `)
    }

}
