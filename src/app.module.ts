import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {DatabaseConfigService} from "./config/database.services"
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CampusesModule } from './campuses/campuses.module';
import { TripModule } from './trip/trip.module';
import { WebsocketGateway } from './websocket/websocket.gateway';



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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    CampusesModule,
    TripModule,
  ],
  controllers: [],
  providers: [WebsocketGateway],
})
export class AppModule {}
