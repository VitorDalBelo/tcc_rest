import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Address } from "./address.entity";

@Entity({name:"passengers"})
export class Passenger {

    @PrimaryGeneratedColumn()
    passenger_id:number
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
    @OneToOne(() => Address) 
    @JoinColumn({ name: 'address_id' })
    address_id: number;
}