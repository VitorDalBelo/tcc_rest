import { Module } from '@nestjs/common';
import { CampusesService } from './campuses.service';
import { CampusesController } from './campuses.controller';
import { Campus } from './entities/campus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Campus])],
  controllers: [CampusesController],
  providers: [CampusesService],
  exports:[CampusesService]
})
export class CampusesModule {}
