import { AccessToken } from "src/auth/entities/access-token.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "src/users/entities/driver.entity";
import { Passenger } from "src/users/entities/passenger.entity";
import { PassengerTrip } from "./passengertrip.entity";
import { Absence } from "./absence.entity";

@Entity({name:"trips"})
export class Trip {
    @PrimaryGeneratedColumn({name:"trip_id"})
    trip_id:number;

    @Column({name:'name',length:255,nullable:false})
    name:string;
    @ManyToOne(() => Driver, driver => driver.trips) 
    @JoinColumn({ name: 'driver_id' })
    driver: Driver; 

    @OneToMany(() => PassengerTrip, passengertrip => passengertrip.trip)
    @JoinColumn({ name: 'tripid' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    passengers: PassengerTrip[];

    @OneToMany(() => Absence, absence => absence.tripid)
    @JoinColumn({ name: 'tripid' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    absence: Absence[];
}
