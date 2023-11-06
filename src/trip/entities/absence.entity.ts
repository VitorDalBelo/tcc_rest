import { Passenger } from "src/users/entities/passenger.entity";
import { 
    Column, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn ,
    JoinColumn,
    DataSource
} from "typeorm";
import { Trip } from "./trip.entity";


@Entity({name:"absences"})
export class Absence {

    @PrimaryGeneratedColumn({name:"absence_id"})
    absence_id:number;

    @Column({name:"absence_date"})
    absence_date: string;

    @Column({name:"go"})
    go: boolean;    

    @Column({name:"back"})
    back: boolean;

    @Column({name:"tripid"})
    tripid: number;

    @Column({name:"passengerid"})
    passengerid: number;

    @ManyToOne(()=>Passenger, passenger => passenger.absence )
    @JoinColumn({name:"passengerid",foreignKeyConstraintName:"fk_passengers_absences"})
    passenger: Passenger;


    /**
     * name
     */
    public static async getTripAbsence(datasource : DataSource , date:string,id:number) : Promise<Array<any>> {
      return await  datasource.query(`
        SELECT string_agg(CAST(a.passengerid AS TEXT), ',') AS passenger_ids
        FROM absences a
        WHERE a.absence_date = '${date}' AND a.tripid = ${id} and (a.go = false or a.back = false);
        `)
        .then(resp =>resp[0]["passenger_ids"].split(","))
        .catch(e=>{
        console.log(e)
        return[]
        })
        }
    public static async getPassengerAbsence(datasource : DataSource, date:string,tripid:number,userid:number){
        // console.log(date,tripid,userid)
        return await datasource.query(`
        select a."go",a."back",a."absence_date" from 
        absences a inner join passengers p on p.passenger_id  = a.passengerid
        where a."absence_date" = '${date}' and a.tripid = ${tripid} and p.user_id  = ${userid} and (a.go = false or a.back = false)
        `)
        .then(resp=>resp[0])
        .catch(()=>null);
    }
}