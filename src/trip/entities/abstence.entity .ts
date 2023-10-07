import { AccessToken } from "src/auth/entities/access-token.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Passenger } from "src/users/entities/passenger.entity";
import { Trip } from "./trip.entity";

@Entity({name:"absences"})
export class Absence {
    @PrimaryGeneratedColumn()
    absence_id:number;
    @Column({name:'absence_date',nullable:false})
    absence_date:string;
    @Column({name:'go',default:true})
    go:boolean;
    @Column({name:'back',default:true})
    back:boolean;
    @ManyToOne(() => Passenger, passager => passager.passenger_id) 
    passager: Passenger; 
    @ManyToOne(() => Trip, trip => trip.trip_id) 
    trip: Trip; 
}


