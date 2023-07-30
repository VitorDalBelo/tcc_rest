import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy } from "passport-http";
import { AuthService } from "../auth.service";


@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy){
    constructor(private authService:AuthService){
        super();
    }

    async validate(email: string,password: string) : Promise<any> {
        const user = await this.authService.validadeUser(email,password);
        return user;
    }
}