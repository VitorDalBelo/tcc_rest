
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Passenger } from "./passenger.entity";

@Entity({ name: 'addresses' }) // Defina o nome da tabela
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bairro', length: 255, nullable: false })
  bairro: string;

  @Column({ name: 'cidade', length: 255, nullable: false })
  cidade: string;

  @Column({ name: 'complemento', length: 255 })
  complemento: string;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude: number;

  @Column({ name: 'logradouro', length: 255, nullable: false })
  logradouro: string;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude: number;

  @Column({ name: 'numero' })
  numero: number;

  @Column({ name: 'pais', length: 255 })
  pais: string;

  @Column({ name: 'uf', length: 2 })
  uf: string;

  @OneToOne(() => Passenger, passager => passager.user_id) 
  passager: Passenger; 
}
