import { AccessToken } from "src/auth/entities/access-token.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./driver.entity";
import { Passenger } from "./passenger.entity";

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
    @Column({name:'photo',length:255})
    photo:string;
    @Column({name:'profile',length:255,nullable:false})
    profile:string;
    @OneToOne(() => AccessToken, accessToken => accessToken.user_id) 
    accessToken: AccessToken; 
    @OneToOne(() => Driver, driver => driver.user_id) 
    driver: Driver; 
    @OneToOne(() => Passenger, passager => passager.user_id) 
    passager: Passenger; 
}
