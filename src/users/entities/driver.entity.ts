import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Coords } from "src/communIntefaces";
import { Van } from "./van.entity";

@Entity({name:"drivers"})
export class Driver {
    @PrimaryGeneratedColumn()
    driver_id:number;
    @Column({name:'cnpj',length:255,nullable:false})
    cnpj:string;
    @Column({name:'mapapreview'})
    mapaPreview:string;
    @Column({name:'descricao'})
    descricao:string;
    @Column("json",{name:"regiaodeatuacao" , array:true})
    regiaoDeAtuacao:Array<Coords>;

    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user_id: number;
    @OneToOne(() => User) 
    @JoinColumn({ name: 'user_id' })
    user: User;


    @OneToOne(() => Van) 
    @JoinColumn({ name: 'van_id' })
    van_id: number;
    @OneToOne(() => Van) 
    @JoinColumn({ name: 'van_id' })
    van: Van;

}