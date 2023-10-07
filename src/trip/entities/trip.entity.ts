import { AccessToken } from "src/auth/entities/access-token.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "src/users/entities/driver.entity";
import { Passenger } from "src/users/entities/passenger.entity";

@Entity({name:"trips"})
export class Trip {
    @PrimaryGeneratedColumn({name:"trip_id"})
    trip_id:number;

    @Column({name:'name',length:255,nullable:false})
    name:string;
    @OneToOne(() => Driver, driver => driver.driver_id) 
    driver: Driver; 

    @OneToMany(() => Passenger, passenger => passenger.trip)
    @JoinColumn({ name: 'trip_id' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    passengers: Passenger[];
    

}
