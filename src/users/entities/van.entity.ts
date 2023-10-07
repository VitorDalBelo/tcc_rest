
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'vans' }) // Defina o nome da tabela
export class Van {
  @PrimaryGeneratedColumn()
  van_id : number;

  @Column({ name: 'van_photo'})
  van_photo: string;

  @Column({ name: 'license_plate', length: 255, nullable: false })
  license_plate: string;

  @Column({ name: 'model', length: 255 })
  model: string;

}
