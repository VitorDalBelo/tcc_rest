import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Coords } from "src/communIntefaces";

@Entity({name:"drivers"})
export class Driver {
    @PrimaryGeneratedColumn()
    driver_id:number;
    @Column({name:'cnpj',length:255,nullable:false})
    cnpj:string;
    @Column({name:'mapapreview'})
    mapaPreview:string;
    @Column("json",{name:"regiaodeatuacao" , array:true})
    regiaoDeAtuacao:Array<Coords>;
    
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
}