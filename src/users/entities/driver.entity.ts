import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name:"drivers"})
export class Driver {
    @PrimaryGeneratedColumn()
    driver_id:number
    @Column({name:'cnpj',length:255,nullable:false})
    cnpj:string
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
}