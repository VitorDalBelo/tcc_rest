import { BadRequestException, Injectable, InternalServerErrorException , NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserInput } from './dto/login-user.input';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessToken } from './entities/access-token.entity';
import { Repository } from 'typeorm';
import { GoogleSingupInput } from './dto/googleSingupGoogle';


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
      else if(!user.hashpassword && user.google_account) throw new UnauthorizedException("Esta conta foi criada com o google e não possui uma senha configurada .Utilize a opção Entrar com o google")
      const checkHash = await bcrypt.compare(password , user.hashpassword).catch(e=> {throw new UnauthorizedException("Senha incorreta.")} )
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


  async singupGoogle(input: GoogleSingupInput,profile:string) {
    if(profile === "passenger" ) {
      const newUser : any = input;
      const passenger = await this.userService.createPassengerGoogle(newUser);
      if(!passenger) throw new InternalServerErrorException("servidor falhou ")
      return passenger
      
    }
    // else if(profile === "driver" ) {
    //   if(!loginUserInput.cnpj) throw new BadRequestException("É necessario informar o cnpj se cadastrar como motorista");
    //   if(loginUserInput.cpf) throw new BadRequestException("Motoristas não possuem cpf");
    //   newUser.cnpj = String(loginUserInput.cnpj).replace(/\D/g,'');
    //   const driver = await this.userService.createDriver(newUser);
    //   if(!driver) throw new InternalServerErrorException("servidor falhou ")
    //   return driver
      
    // }
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

  findOne(email:string) {
    return this.userService.findOne(email);
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
