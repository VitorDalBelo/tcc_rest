import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {PassportModule} from "@nestjs/passport"
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { BasicAuthStrategy } from './strategies/basic.strategy';
import { JwtAuthStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { AccessToken } from './entities/access-token.entity';

@Module({
  imports:[UsersModule,PassportModule,JwtModule.register({
    signOptions:{expiresIn:"3600s"},
    secret:process.env.JWT_SECRET,
  }),
  TypeOrmModule.forFeature([AccessToken])
],
  controllers: [AuthController],
  providers: [AuthService,BasicAuthStrategy,JwtAuthStrategy]
})
export class AuthModule {}
