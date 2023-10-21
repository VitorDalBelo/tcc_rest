import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAbsenceDto } from 'src/trip/dto/create-absence.dto';
import { Absence } from 'src/trip/entities/absence.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AbsenceService {
    constructor(
        @InjectRepository(Absence)
        private readonly absenceRepository: Repository<Absence>
    ){}

   async create(newAbsence : CreateAbsenceDto,trip_id:number,passenger_id:number){
        let absence = await this.absenceRepository.findOne({
            where:{
                tripid:trip_id,
                passengerid:passenger_id,
                absence_date: newAbsence.absence_date
            }})

        if(!absence) absence = this.absenceRepository.create({...newAbsence,tripid:trip_id,passengerid:passenger_id});
        else{
            absence.go = newAbsence.go;
            absence.back = newAbsence.back;
        }
        return await this.absenceRepository.save(absence);
    }
}
