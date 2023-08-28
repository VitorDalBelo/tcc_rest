import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name:"passengers"})
export class Passenger {

    @PrimaryGeneratedColumn()
    passenger_id:number
    @Column({name:"cpf",length:255 , nullable:false})
    cpf:string
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
}