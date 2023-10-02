import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable,UnauthorizedException } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import axios from "axios";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,"google"){
    constructor(private authService:AuthService){
        super();
    }

    static key = "google"

    async validate(req: Request): Promise<User> {
        const {googletoken} = req.headers as any ;
        if(!googletoken) throw new UnauthorizedException("token não informado");
        const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googletoken}`;
        console.log(url)
        const {email,picture} = await axios.get(url)
        .then(resp=>resp.data).catch(e=>{throw new UnauthorizedException("token inválido")});
        const user = await this.authService.findOne(email);
        console.log(email)
        if(!user)throw new UnauthorizedException("usuário não encontrado");
        return user

    }
}