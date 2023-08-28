import { 
  Controller, 
  Get, 
  Post, 
  Body,
  Headers, 
  Query, 
  BadRequestException, 
  UseGuards,
  Req} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

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

  @UseGuards(AuthGuard('basic'))
  @Post("/login")
  async login(@Req() req : any){
    return await this.authService.login(req.user);
  }

  @Post("/refresh")
  async refresh(@Req() req : Request){
    const oldToken = req.headers.authorization.replace("Bearer ","");
    return this.authService.refresh(oldToken);
  }



}
