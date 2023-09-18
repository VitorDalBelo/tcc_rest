import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampusesService } from './campuses.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Controller('campuses')
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  @Post()
  create(@Body() createCampusDto: CreateCampusDto) {
    return this.campusesService.create(createCampusDto);
  }

  @Get()
  findAll() {
    return this.campusesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campusesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampusDto: UpdateCampusDto) {
    return this.campusesService.update(+id, updateCampusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campusesService.remove(+id);
  }
}
