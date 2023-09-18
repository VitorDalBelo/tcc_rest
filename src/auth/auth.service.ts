import { BadRequestException, Injectable, InternalServerErrorException , NotFoundException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserInput } from './dto/login-user.input';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessToken } from './entities/access-token.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(
    private  userService : UsersService,
    private  jwtService : JwtService ,
    @InjectRepository(AccessToken)
    private readonly accessTokenRepository : Repository<AccessToken>
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
    const {password,...rest} = loginUserInput;
    const hashpassword = await bcrypt.hash(password,10);
    const newUser : any = { hashpassword,...rest};
    if(profile === "passenger" ) {
      if(loginUserInput.cnpj) throw new BadRequestException("Passageiros não possuem cnpj");
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

  async login(user:User){
    const {hashpassword,...userDTO} = user;
    const response ={
      access_token: this.jwtService.sign(userDTO),
      user:userDTO
    }
    const accessTokenEntity:AccessToken =  this.accessTokenRepository.create({token:response.access_token,user_id:user.user_id});

     this.accessTokenRepository.insert(accessTokenEntity)
     .catch(()=>{
      this.accessTokenRepository.update(user.user_id,{token:response.access_token})
      .catch(e=>console.log(e))
     })

    return response;
    
  }


  async refresh(oldToken:string)  {
    const accessTokenEntity : any = await this.accessTokenRepository.findOne({where:{token:oldToken},relations:["user_id"],relationLoadStrategy:"query"});
    if(!accessTokenEntity || !accessTokenEntity.user_id) throw new NotFoundException("Usuário não encontrado");
    const user = {...accessTokenEntity.user_id};
    return await this.login(user);
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
