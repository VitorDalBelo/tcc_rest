import { Module } from '@nestjs/common';
import { TripService } from './services/trip/trip.service';
import { TripController } from './trip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Absence } from './entities/absence.entity';
import { AbsenceService } from './services/absence/absence.service';
import { UsersModule } from 'src/users/users.module';
import { CampusesModule } from 'src/campuses/campuses.module';

@Module({
  imports:[TypeOrmModule.forFeature([Trip,Absence]),UsersModule,CampusesModule],
  controllers: [TripController],
  providers: [TripService, AbsenceService, ],
  exports:[TripService]
})
export class TripModule {}
