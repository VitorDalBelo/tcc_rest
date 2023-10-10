import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from 'src/users/entities/passenger.entity';
import { NEVER } from 'rxjs';

@Injectable()
export class TripService {

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository : Repository<Trip>,
  ){}
  create(createTripDto: CreateTripDto) {
    return 'This action adds a new trip';
  }

  findAll() {
    return `This action returns all trip`;
  }

  async findOne(id: number) {

    return await this.tripRepository.findOne({ 
      where: { trip_id: id , passengers:{passenger:{passenger_id:2}} },
      relations:['passengers.passenger', 'passengers.passenger.user','passengers.passenger.address'],
      select:{
        passengers:{
        passenger:{
          user:{
            user_id:true,
            name:true,
            email:false,
            hashpassword:false,
            photo:true,
            phone:false,
            profile:false,
            google_account:false,
          },
      }},
    },
      relationLoadStrategy:"query",
    });
  }
  
  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
