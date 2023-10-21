import { Injectable } from '@nestjs/common';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Campus } from './entities/campus.entity';
import { Repository } from 'typeorm';
@Injectable()
export class CampusesService {
  constructor(
    @InjectRepository(Campus)
    private readonly campusesRepository : Repository<Campus>
  ){}

  create(createCampusDto: CreateCampusDto) {
    return 'This action adds a new campus';
  }

  async findAll() {
    return await this.campusesRepository.find(
      {
        relations:['address_id']
      }
    )
  }

  findOne(id: number) {
    return `This action returns a #${id} campus`;
  }

  update(id: number, updateCampusDto: UpdateCampusDto) {
    return `This action updates a #${id} campus`;
  }

  remove(id: number) {
    return `This action removes a #${id} campus`;
  }
}
