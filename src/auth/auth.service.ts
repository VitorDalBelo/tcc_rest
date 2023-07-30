import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserInput } from './dto/login-user.input';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {
  constructor(
    private  userService : UsersService,
    private  jwtService : JwtService  
  ){}

  

  async validadeUser(email:string,password:string):Promise<any> {
      const user = await this.userService.findOne(email);
      if(!user) return null;
      const checkHash = await bcrypt.compare(password , user.hashpassword)
      if(checkHash){
          const {hashpassword,...result} =user;
          return result;
      } 
      return null ;
  }    
  async singup(loginUserInput: LoginUserInput,profile:string) {
    const hashpassword = await bcrypt.hash(loginUserInput.password,10);
    const newUser : any = {
      name:loginUserInput.name,
      hashpassword,
      email:loginUserInput.email,
    }
    if(profile === "passenger" ) {
      if(!loginUserInput.cpf) throw new BadRequestException("É necessario informar o cpf se cadastrar como passageiro");
      if(loginUserInput.cnpj) throw new BadRequestException("Passageiros não possuem cnpj");
      newUser.cpf = String(loginUserInput.cpf).replace(/\D/g,'');
      const passenger = await this.userService.createPassenger(newUser);
      if(!passenger) throw new InternalServerErrorException("servidor falhou ")
      return passenger
      
    }
    else if(profile === "driver" ) {
      if(!loginUserInput.cnpj) throw new BadRequestException("É necessario informar o cnpj se cadastrar como motorista");
      if(loginUserInput.cpf) throw new BadRequestException("Motoristas não possuem cpf");
      newUser.cnpj = String(loginUserInput.cnpj).replace(/\D/g,'');
      const driver = await this.userService.createDriver(newUser);
      if(!driver) throw new InternalServerErrorException("servidor falhou ")
      return driver
      
    }
    else throw new BadRequestException("papel de usuário inesistente.");
  }

  login(user:User){
    return{
      access_token: this.jwtService.sign(user),
      user
    }
    
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
