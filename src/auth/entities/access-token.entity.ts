import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToOne,JoinColumn, PrimaryColumn } from "typeorm";

@Entity({name:'accesstokens'})
export class AccessToken {
    @Column({name:'token',length:255,unique:true})
    token:string;
    
    @PrimaryColumn()
    @OneToOne(() => User) // Define o relacionamento 1-1 com a entidade User
    @JoinColumn({ name: 'user_id' })
    user_id: number;
    
}

