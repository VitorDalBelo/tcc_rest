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
import { Van } from './entities/van.entity';

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
    @InjectRepository(Van)
    private readonly vanRepository : Repository<Van>,
        
    private dataSource: DataSource,
  ){}

  async getPassengerTrips(user_id: number) {
    return await this.passengerRepository.findOne(
      {
        where:{user_id},
        relations:['trips','trips.trip','trips.trip.driver','trips.trip.driver.user',"trips.trip.driver.van"],
        select:{
          trips:{
            trip:{
              driver:{
                driver_id: true,
                cnpj: false,
                mapaPreview: false,
                descricao: false,
                regiaoDeAtuacao: false,
                user:{
                  user_id:true,
                  name:true,
                  email:false,
                  hashpassword:false,
                  photo:true,
                  phone:false,
                  profile:false,
                  google_account:false,
                }
              }
            }
          }
        },
        relationLoadStrategy:"query"
      },
      )
  }

  async getDriverTrips(user_id: number) {
    const driver : any = await this.driverRepository.findOne(
      {
        where: { user_id },
        relations: ['trips']
      }
    );
  
    // Verifica se o motorista foi encontrado
    if (!driver) {
      return null; // Ou lance uma exceção se for o caso
    }
  
    // Mapeia os objetos 'trips' para incluir a propriedade 'trip'
    const tripsWithTripProperty = driver.trips.map((trip) => ({
      trip: trip // Ou seja, você está aninhando 'trip' dentro de um objeto 'trip'
    }));
  
    // Atualiza o objeto driver para incluir a nova propriedade 'trips'
    driver.trips = tripsWithTripProperty;
  
    return driver;
  }



  async getDriversForPassenger(name?:string) {
    const query =  this.dataSource.createQueryBuilder()
      .select([
        'd.descricao as description',
        'u.google_account as google_account', 
        'u.photo as photo',
        'u.name as name',
        'u.user_id as user_id',
        'v.license_plate as license_plate',
        'v.model as van_model'
      ])
      .from(Driver, 'd')  
      .innerJoin(User, 'u', 'u.user_id = d.user_id')  
      .leftJoin("vans", 'v', 'd.van_id = v.van_id')  

      console.log("query",query)

      return name ? query.where(`u.name ILIKE '%${name}%'`).execute() : query.execute()
  }
  
  async getSearchPassenger(name?:string) {
    const query =  this.dataSource.createQueryBuilder()
      .select([
        'p.passenger_id',
        'u.google_account as google_account', 
        'u.photo as photo',
        'u.name as name',
      ])
      .from(Passenger, 'p')  
      .innerJoin(User, 'u', 'u.user_id = p.user_id')  

      console.log("query",query)

      return name ? query.where(`u.name ILIKE '%${name}%'`).execute() : query.execute()
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

 async getPassenger(user_id:number){
  return await this.passengerRepository.findOne({where:{user_id}})
 }

 async getuser(user_id:number){
  return await this.userRepository.findOne({where:{user_id}})
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

   async createDriverGoogle(newDriver : any) {
    console.log(newDriver);
    const userExits = await this.findOne(newDriver.email)
    if(userExits) throw new ConflictException("Existe outro usuário com este email");
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {cnpj} = newDriver;
    let user = {
      name:newDriver.name,
      email:newDriver.email,
      profile: "driver",
      phone: newDriver.phone,
      photo: newDriver.photo,
      google_account:newDriver.google_account,
     };
     if(newDriver.desc) newDriver.descricao = newDriver.desc;  
     if(newDriver.van && newDriver.van.placa) newDriver.van.license_plate = newDriver.van.placa;
     if(newDriver.van && newDriver.van.modelo) newDriver.van.model = newDriver.van.modelo;
    try{
      const userEntity : User =  await this.userRepository.create(user);
      const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
      const vanEntity = this.vanRepository.create(newDriver.van as Van);
      const {van_id} = await queryRunner.manager.save(vanEntity);
      const passenger = {cnpj:cnpj,user_id:userInfo.user_id,descricao:newDriver.descricao,van_id:van_id};
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
  async createDriver(newDriver : any) {
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
      phone: newDriver.phone
     };
     if(newDriver.desc) newDriver.descricao = newDriver.desc;  
     if(newDriver.van && newDriver.van.placa) newDriver.van.license_plate = newDriver.van.placa;
     if(newDriver.van && newDriver.van.modelo) newDriver.van.model = newDriver.van.modelo;
    try{
      const userEntity : User =  await this.userRepository.create(user);
      const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
      const vanEntity = this.vanRepository.create(newDriver.van as Van);
      const {van_id} = await queryRunner.manager.save(vanEntity);
      const passenger = {cnpj:cnpj,user_id:userInfo.user_id,descricao:newDriver.descricao,van_id:van_id};
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
