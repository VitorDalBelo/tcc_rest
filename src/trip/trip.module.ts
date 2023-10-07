import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Absence } from './entities/abstence.entity ';

@Module({
  imports:[TypeOrmModule.forFeature([Trip,Absence])],
  controllers: [TripController],
  providers: [TripService]
})
export class TripModule {}
