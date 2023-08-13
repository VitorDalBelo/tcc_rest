import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy,VerifyCallback} from 'passport-google-oauth20'
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy,'google'){
    constructor(private usersService:UsersService){
        super({
            clientID:'329088296130-f20as8pp6kvcacl7l6h8or49iajm5bnb.apps.googleusercontent.com',
            clientSecret:'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',
            callbackURL:'https://12f7-177-181-2-218.ngrok-free.app/auth/login/google/callback',
            scope:['email','profile']

        })
    }

    async validate(accesToken:string , refreshToken:string , profile:any , done: VerifyCallback): Promise<any>{
        const {hashpassword,...user}  = await this.usersService.findOne(profile._json.email); 
        return user
    }
}