import { Address } from "../entities/address.entity";

export class GetPassengerDto {
    user_id: number;
    name:string;
    email:string;
    profile:string;
    passenger_id:number;
    photo:string;
    address:Address
}
