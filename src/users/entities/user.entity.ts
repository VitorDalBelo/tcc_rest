import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'users'})
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;
    @Column({name:'name',length:255,nullable:false})
    name:string;
    @Column({name:'email',length:255,nullable:false})
    email:string;
    @Column({name:'hashpassword',length:255,nullable:false})
    hashpassword:string;
    @Column({name:'profile',length:255,nullable:false})
    profile:string;
}
