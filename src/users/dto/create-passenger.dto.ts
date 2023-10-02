import { Address } from "../entities/address.entity";
import { CreateAddressDTO } from "./create-address.dto";

export class CreatePassengerDto {
    name:string;
    email:string;
    hashpassword?:string;
    phone:string;
    address:Address;
    campus_id:number;
    google_account?:boolean
}
