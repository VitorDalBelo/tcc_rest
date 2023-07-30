import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {DatabaseConfigService} from "./config/database.services"
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    UsersModule, 
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService]
    }),
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
