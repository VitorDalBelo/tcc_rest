import {Server,Socket} from "socket.io"
import { OnModuleInit ,UseGuards} from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer  } from '@nestjs/websockets';
import { AuthGuard } from '@nestjs/passport';
import { TripService } from "src/trip/services/trip/trip.service";


@WebSocketGateway()
export class WebsocketGateway implements OnModuleInit {


  @WebSocketServer()
  server: Server;

  constructor(private readonly tripService: TripService) {}

  onModuleInit() {
    this.server.on('connection',(socket)=>{
      console.log("socket.id", this.tripService.findAll());
    })
  }
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    client.handshake
    console.log(payload)
    return 'Hello world!';
  }

  @SubscribeMessage('joinTrip')
  handleTripJoin(client: Socket, trip: string ) {
    client.join(trip);
    client.emit('joinedTrip', trip);
  }

  @SubscribeMessage('startTrip')
  strartTrip(client: Socket, trip: {tripId:number ,coords:{latitude:number,longitude:number}} ) {
    console.log(trip)
    client.join(String(trip.tripId));
    this.tripService.startTrip(trip.tripId,trip.coords)
    .then(route=>client.emit('tripStarted',route))
  }

  @SubscribeMessage('trip')
  handleTripInfoJoin(client: Socket, payload: {trip:string , message:any} ) {
    this.server.to(payload.trip).emit("tripClient",payload.message)
  }
}
