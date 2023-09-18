import { Address } from "src/users/entities/address.entity";
import { Entity, PrimaryGeneratedColumn, Column ,JoinColumn,OneToOne} from "typeorm";

@Entity({name:"campuses"})
export class Campus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'campus', length: 255, nullable: false })
    campus: string;

    @OneToOne(() => Address) 
    @JoinColumn({ name: 'address_id' })
    address_id: number;

}
