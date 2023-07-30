import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name:"passengers"})
export class Passenger extends User{
    @PrimaryGeneratedColumn()
    passenger_id:number
    @Column({name:"cpf",length:255 , nullable:false})
    cpf:string
}