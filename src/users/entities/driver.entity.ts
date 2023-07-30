import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name:"drivers"})
export class Driver extends User{
    @PrimaryGeneratedColumn()
    driver_id:number
    @Column({name:'cnpj',length:255,nullable:false})
    cnpj:string
}