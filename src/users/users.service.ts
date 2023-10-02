import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { GetPassengerDto } from './dto/get-passenger.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { Address } from './entities/address.entity';
import * as Yup from "yup";
import { NotFoundError } from 'rxjs';
import { Coords } from 'src/communIntefaces';

const   addressSchema  = Yup.object({
  bairro: Yup.string().required("O endereço não pode ser cadastrado sem o bairro"),
  cidade: Yup.string().required("O endereço não pode ser cadastrado sem a cidade"),
  latitude: Yup.number().typeError("O campo latitude deve ser um valor numérico.").required("O campo latitude é obrigatório."),
  logradouro: Yup.string().required("O campo logradouro é obrigatório."),
  longitude: Yup.number().typeError("O campo longitude deve ser um valor numérico.").required("O campo longitude é obrigatório."),
  numero: Yup.number().typeError("O campo número deve ser um valor numérico.").required("O campo número é obrigatório."),
  pais: Yup.string().required("O campo país é obrigatório."),
  uf: Yup.string().required("O campo UF é obrigatório."),
})

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository : Repository<Driver>,
    @InjectRepository(Passenger)
    private readonly passengerRepository : Repository<Passenger>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository : Repository<Address>,
        
    private dataSource: DataSource,
  ){}


  async getDriversForPassenger(){
    return await this.dataSource.createQueryBuilder()
    .select(['driver.mapapreview', 'driver.descricao', 'user.photo'])
    .innerJoin('driver.user', 'user', 'user.user_id = driver.user_id')
    .getMany()

  }

  async getUserDriverInfo(user_id:number):Promise<any>{
      const {user_id:user,...driver} = await this.driverRepository.findOne({where:{user_id},relations:["user_id"],relationLoadStrategy:"query"})
      const {hashpassword, ...restUser} = user as any;

      return {driver:driver,user:restUser};
    }
  async atualizaRegiao(user_id: number, regiaoDeAtuacao: Array<Coords>,preview:string) {
    try {
      const driver = await this.driverRepository.findOne({where:{ user_id }});
      if (!driver) {
        throw new NotFoundException('Motorista não encontrado');
      }

      let coords = ""

      regiaoDeAtuacao.forEach(coord =>{
        coords += `'{"latitude": ${coord.latitude}, "longitude": ${coord.longitude}}'::jsonb,`
      })
      coords = coords.slice(0,-1);


      await this.dataSource.createQueryRunner().query(`update drivers set mapaPreview = '${preview}' , regiaoDeAtuacao = ARRAY[${coords}]where user_id = ${user_id}`);
  
      return {...driver,regiaoDeAtuacao };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to update driver region');
    }
  }

  async validateAddress(address:object) {
    return  addressSchema.validate(address)
            .then(()=>{
              return {result:true,message:""}
            })
            .catch(e=>{
              return {result:false,message:e.errors[0]}
            })
  }



  async createPassenger(newPassenger : CreatePassengerDto) : Promise<GetPassengerDto> {
   const userExits = await this.findOne(newPassenger.email);
   if(userExits) throw new ConflictException("Existe outro usuário com este email");
   const queryRunner = this.dataSource.createQueryRunner();
   const {address} = newPassenger;
   if(!address) throw new BadRequestException("É necessario informar o endereço do usuário.");
   const addressValidation = await this.validateAddress(address);
   if(!addressValidation.result) throw new BadRequestException(addressValidation.message);
   let user = {
     name:newPassenger.name,
     hashpassword: newPassenger.hashpassword,
     email:newPassenger.email,
     profile: "passenger",
     phone: newPassenger.phone,
    }
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{
      const userEntity : User =  await this.userRepository.create(user);
      const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
      const addressEntity : Address = await this.addressRepository.create(address);
      const addressInfo = await queryRunner.manager.save(addressEntity);
      const passenger = {user_id:userInfo.user_id,address_id:addressInfo.id,campus_id:newPassenger.campus_id};
      const passengerEntity =  await this.passengerRepository.create(passenger);
      const passengerInfo = await queryRunner.manager.save(passengerEntity);
      await queryRunner.commitTransaction();
      return {...userInfo,...passengerInfo,address:addressInfo};

    }catch(err){
      console.log("transaction_error",err)
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Tansação não processada")
    }
    finally{
      await queryRunner.release();
    }
  }

  async createPassengerGoogle(newPassenger : any) : Promise<GetPassengerDto> {
    const userExits = await this.findOne(newPassenger.email);
    if(userExits) throw new ConflictException("Existe outro usuário com este email");
    const queryRunner = this.dataSource.createQueryRunner();
    const {address} = newPassenger;
    if(!address) throw new BadRequestException("É necessario informar o endereço do usuário.");
    const addressValidation = await this.validateAddress(address);
    if(!addressValidation.result) throw new BadRequestException(addressValidation.message);
    let user = {
      name:newPassenger.name,
      email:newPassenger.email,
      profile: "passenger",
      phone: newPassenger.phone,
      photo: newPassenger.photo,
      google_account:newPassenger.google_account
     }
     await queryRunner.connect();
     await queryRunner.startTransaction();
     try{
       const userEntity : User =  await this.userRepository.create(user);
       const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
       const addressEntity : Address = await this.addressRepository.create(address as Address);
       const addressInfo = await queryRunner.manager.save(addressEntity);
       const passenger = {user_id:userInfo.user_id,address_id:addressInfo.id,campus_id:newPassenger.campus_id};
       const passengerEntity =  await this.passengerRepository.create(passenger);
       const passengerInfo = await queryRunner.manager.save(passengerEntity);
       await queryRunner.commitTransaction();
       return {...userInfo,...passengerInfo,address:addressInfo};
 
     }catch(err){
       console.log("transaction_error",err)
       await queryRunner.rollbackTransaction();
       throw new InternalServerErrorException("Tansação não processada")
     }
     finally{
       await queryRunner.release();
     }
   }
  async createDriver(newDriver : CreateDriverDto) {
    const userExits = await this.findOne(newDriver.email)
    if(userExits) throw new ConflictException("Existe outro usuário com este email");
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {cnpj} = newDriver;
    let user = {
      name:newDriver.name,
      hashpassword: newDriver.hashpassword,
      email:newDriver.email,
      profile: "driver",
     };
    try{
      const userEntity : User =  await this.userRepository.create(user);
      const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
      const passenger = {cnpj:cnpj,user_id:userInfo.user_id};
      const driverEntity =  await this.driverRepository.create(passenger);
      const {regiaoDeAtuacao,...driverInfo} = await queryRunner.manager.save(driverEntity);
      await queryRunner.commitTransaction();
      return {...userInfo,...driverInfo };
    }catch(err){
      console.log("transaction_error",err)
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Tansação não processada")
    }
    finally{
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.userRepository.find() ;
  }

  async findOne(email:string) : Promise<User | null>{
    return await this.userRepository.findOne({where:{email}});
  }

  async findOnePassenger(userId:number) : Promise<Passenger | null>{
    return await this.passengerRepository.findOne({where:{user_id:userId}});
  }
  async findOneDriver(userId:number) : Promise<Driver | null>{
    return await this.driverRepository.findOne({where:{user_id:userId}});
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
