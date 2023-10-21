import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Req, 
  NotFoundException
} from '@nestjs/common';
import { TripService } from './services/trip/trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { AbsenceService } from './services/absence/absence.service';
import { UsersService } from 'src/users/users.service';
import { NotFoundError } from 'rxjs';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly absenceService: AbsenceService,
    private readonly userService : UsersService
  ) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Get()
  findAll() {
    return this.tripService.findAll();
  }
  @Get(':id/route')
  async getRoute(@Param('id') id: string){
    return await this.tripService.getRoute(Number(id))
  }

  @Get(':id')
  @UseGuards(AuthGuard("jwt"))
  async findOne(@Param('id') id: string,@Req() req : Request) {
    const user = req.user as User;
    if(user.profile == "passenger"){
      const userAbsences = await this.tripService.getPassengerAbsence(Number(id),user.user_id);
      const trip = await this.tripService.findOne(Number(id));
      return {...trip,userAbsences}
    }
    return await this.tripService.findOne(Number(id));
  }

  @Post(':id/absence')
  @UseGuards(AuthGuard("jwt"))
  async registerAbsence(@Param('id') id: string,@Req() req : Request,@Body() body : CreateAbsenceDto){
    const user = req.user as User;
    const passenger = await this.userService.getPassenger(user.user_id);
    if(!passenger) throw new NotFoundException("Passageiro não encontrado");
    return await this.absenceService.create(body,Number(id),passenger.passenger_id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.remove(+id);
  }
}
