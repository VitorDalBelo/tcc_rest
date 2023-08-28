import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { DataSource, Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';
import { LoginUserInput } from 'src/auth/dto/login-user.input';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { GetPassengerDto } from './dto/get-passenger.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { query } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository : Repository<Driver>,
    @InjectRepository(Passenger)
    private readonly passengerRepository : Repository<Passenger>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    
    private dataSource: DataSource
  ){}
 async createPassenger(newPassenger : CreatePassengerDto) : Promise<GetPassengerDto> {
   const userExits = await this.findOne(newPassenger.email)
   if(userExits) throw new ConflictException("Existe outro usuário com este email");
   const queryRunner = this.dataSource.createQueryRunner();
   const {cpf} = newPassenger;
   let user = {
     name:newPassenger.name,
     hashpassword: newPassenger.hashpassword,
     email:newPassenger.email,
     profile: "passenger",
     
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{
      const userEntity : User =  await this.userRepository.create(user);
      const {hashpassword,...userInfo} = await queryRunner.manager.save(userEntity);
      const passenger = {cpf:cpf,user_id:userInfo.user_id};
      const passengerEntity =  await this.passengerRepository.create(passenger);
      const passengerInfo = await queryRunner.manager.save(passengerEntity);
      await queryRunner.commitTransaction();
      return {...userInfo,...passengerInfo};

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
      const driverInfo = await queryRunner.manager.save(driverEntity);
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
