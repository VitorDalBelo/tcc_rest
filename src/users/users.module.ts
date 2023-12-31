import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Driver } from './entities/driver.entity';
import { Passenger } from './entities/passenger.entity';
import { Address } from './entities/address.entity';
import { Van } from './entities/van.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,Driver,Passenger,Address,Van])],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
