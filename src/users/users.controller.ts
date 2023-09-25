import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req, ForbiddenException , UseInterceptors, UploadedFile} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Coords } from 'src/communIntefaces';
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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(Number(id));
  // }


  @Post('/drivers/area')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor("imagem"))
  async holdCoords( @Body() body: regiao , @Req() req : Request , @UploadedFile() file: Express.Multer.File){
    const regiao = JSON.parse(body.regiaoDeAtuacao)
    const user  = req.user as User;

    if(user.profile !== "driver") throw new ForbiddenException("Você não tem permissão de motorista.");
    const imageBuffer = Buffer.from(body.imagem, 'base64');
    const filename = `${Date.now()}_${user.user_id}.png`;
    const filePath = path.join(__dirname, '..','..', 'public','mapas', filename);
    fs.writeFileSync(filePath, imageBuffer);
    const result = await this.usersService.atualizaRegiao(Number(user.user_id),regiao)
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
