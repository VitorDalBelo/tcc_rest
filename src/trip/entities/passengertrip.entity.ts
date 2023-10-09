import { AccessToken } from "src/auth/entities/access-token.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "src/users/entities/driver.entity";
import { Passenger } from "src/users/entities/passenger.entity";
import { Trip } from "./trip.entity";

@Entity({name:"passengers_trips"})
export class PassengerTrip {
 

    @PrimaryGeneratedColumn({name:"passenger_trip_id"})
    passenger_trip_id:number;

    @ManyToOne(() => Trip, trip => trip.passengers)
    @JoinColumn({ name: 'tripid' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    trip: Trip;

    @ManyToOne(() => Passenger, passenger => passenger.passengertrip)
    @JoinColumn({ name: 'passengerid' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    passenger: Passenger;
    

}
