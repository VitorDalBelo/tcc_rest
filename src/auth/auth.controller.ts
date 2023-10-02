import { 
  Controller, 
  Get, 
  Post, 
  Body,
  Headers, 
  Query, 
  BadRequestException, 
  UseGuards,
  Req,
  UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input'
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import axios from "axios"
import { LoginGoogleInput } from './dto/login-userGoogle.input';
import { User } from 'src/users/entities/user.entity';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    ) {}

  @Post("/singup")
  async singup(@Body() loginUserInput: LoginUserInput,@Query("profile") profile) {
    if(profile !== "passenger" && profile !== "driver") throw new BadRequestException("papel de usuário inesistente.");

    return this.authService.singup(loginUserInput,profile);
  }

  @Post("/singup/google")
  async singupGoogle(@Body() loginUserInput: LoginGoogleInput,@Query("profile") profile) {
    if(profile !== "passenger" && profile !== "driver") throw new BadRequestException("papel de usuário inesistente.");
    const newUser = new User();
    await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${loginUserInput.googleToken}`)
    .then(resp=>{
      newUser.name = resp.data.name;
      newUser.email = resp.data.email;
      newUser.photo = String(resp.data.picture).split("\\u")[0];
      newUser.google_account=true;
    })
    .catch(e=> {throw new UnauthorizedException("Usuário autorizado")})
    return this.authService.singupGoogle({...newUser,...loginUserInput},profile);
  }

  @UseGuards(AuthGuard('basic'))
  @Post("/login")
  async login(@Req() req : any){
    const user = req.user as User;
    if(user.google_account) throw new UnauthorizedException("Selecione a opção entrar com o google")
    return await this.authService.login(req.user);
  }

  @Post("/refresh")
  async refresh(@Req() req : Request){
    const oldToken = req.headers.authorization.replace("Bearer ","");
    return this.authService.refresh(oldToken);
  }

  @UseGuards(AuthGuard('google'))
  @Post("/login/google")
  async googleLogin(@Req() req : Request){
    return await this.authService.login(req.user as User);
  }




}
