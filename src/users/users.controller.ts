import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req, ForbiddenException , UseInterceptors, UploadedFile} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';

interface regiao{
  regiaoDeAtuacao:string,
  imagem:string
}
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/trips')
  @UseGuards(AuthGuard('jwt'))
  async getTrips(@Req() req : Request){
    const user = req.user as User;
    if(user.profile=="driver") return await this.usersService.getDriverTrips(Number(user.user_id));
    return await this.usersService.getPassengerTrips(Number(user.user_id))
  }

  @Get('/drivers/me')
  @UseGuards(AuthGuard('jwt'))
  async getMeDriver(@Req() req : Request){
    const user = req.user as User;
    return await this.usersService.getUserDriverInfo(user.user_id);
  }

  @Get('/drivers/search')
  @UseGuards(AuthGuard('jwt'))
  async searchDriver(@Req() req : Request){
    const user = req.user as User;
    if(user.profile !== "passenger") throw new ForbiddenException("apenas passageiros tem acesso a pesquisa de motoristas");
    return await this.usersService.getDriversForPassenger(req.query.name?String(req.query.name):undefined)    
  }

  @Get('/passenger/search')
  @UseGuards(AuthGuard('jwt'))
  async searchPassenger(@Req() req : Request){
    const user = req.user as User;
    return await this.usersService.getSearchPassenger(req.query.name?String(req.query.name):undefined)    
  }




  @Post('/drivers/area')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor("imagem"))
  async holdCoords( @Body() body: regiao , @Req() req : Request , @UploadedFile() file: Express.Multer.File){
    const regiao = JSON.parse(body.regiaoDeAtuacao)
    const user  = req.user as User;

    if(user.profile !== "driver") throw new ForbiddenException("Você não tem permissão de motorista.");
    const imageBuffer = Buffer.from(body.imagem, 'base64');
    const filename = `public/mapas/${Date.now()}_${user.user_id}.png`;
    const filePath = path.join(__dirname, '..','..', filename);
    fs.writeFileSync(filePath, imageBuffer);
    const result = await this.usersService.atualizaRegiao(Number(user.user_id),regiao,filename)
    return result
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
