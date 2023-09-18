import { DataSource, DataSourceOptions } from "typeorm";
import 'dotenv/config';

const dataSourceOptions: DataSourceOptions ={
    type:"postgres",
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT),
    username:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    entities:[__dirname + '/../**/*.entity{.js,ts}'],
    migrations:[__dirname + '/seeds/*.{.js,ts}'],
    migrationsTableName:"seeds",
    
    // ssl: {
    //     rejectUnauthorized: false, // Isso desativa a verificação de certificado SSL. Use com cautela!
    // }
}

const dataSource = new DataSource(dataSourceOptions);


export default dataSource;