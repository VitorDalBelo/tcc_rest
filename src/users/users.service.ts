import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';
import { LoginUserInput } from 'src/auth/dto/login-user.input';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { GetPassengerDto } from './dto/get-passenger.dto';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository : Repository<Driver>,
    @InjectRepository(Passenger)
    private readonly passengerRepository : Repository<Passenger>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
  ){}
 async createPassenger(newPassenger : CreatePassengerDto) : Promise<GetPassengerDto> {
    const userExits = await this.findOne(newPassenger.email)
    if(userExits) throw new ConflictException("Existe outro usuário com este email");
    const passengerEntity = this.passengerRepository.create(newPassenger);
    const {user_id} = await this.passengerRepository.save(passengerEntity);
    const {hashpassword,...passenger} = await this.passengerRepository.findOneBy({user_id});
    return passenger
    
  }
  async createDriver(newDriver : CreateDriverDto) {
    const userExits = await this.findOne(newDriver.email)
    if(userExits) throw new ConflictException("Existe outro usuário com este email");
    const driverEntity = this.driverRepository.create(newDriver);
    const {user_id} = await this.driverRepository.save(driverEntity);
    const {hashpassword,...driver} = await this.driverRepository.findOneBy({user_id});
    return driver
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
