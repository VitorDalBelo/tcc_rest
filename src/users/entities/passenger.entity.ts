import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Address } from "./address.entity";
import { Campus } from "src/campuses/entities/campus.entity";
import { Trip } from "src/trip/entities/trip.entity";
import { PassengerTrip } from "src/trip/entities/passengertrip.entity";

@Entity({name:"passengers"})
export class Passenger {

    @PrimaryGeneratedColumn()
    passenger_id:number
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user: User;
    @OneToOne(() => Address) 
    @JoinColumn({ name: 'address_id' })
    address_id: number;
    @OneToOne(() => Address) 
    @JoinColumn({ name: 'address_id' })
    address: Address;
    @Column({ name: 'campus'})
    campus_id: number;
    @OneToOne(() => Campus, campus => campus.id) 
    campus: Campus; 
    @OneToMany(() => PassengerTrip, passengertrip => passengertrip.passenger)
    @JoinColumn({ name: 'passengerid' }) // Especifique o nome da coluna na tabela Passenger que faz a referência à coluna trip_id na tabela Trip
    trips: PassengerTrip[];
    
}