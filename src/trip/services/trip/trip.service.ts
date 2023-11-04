import { Injectable } from '@nestjs/common';
import { CreateTripDto } from '../../dto/create-trip.dto';
import { UpdateTripDto } from '../../dto/update-trip.dto';
import { Trip } from '../../entities/trip.entity';
import { Repository ,DataSource, DeepPartial} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Absence } from '../../entities/absence.entity';
import { CampusesService } from 'src/campuses/campuses.service';
import axios from "axios"
import { PassengerTrip } from 'src/trip/entities/passengertrip.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Distância em milhas

  return dist;
}

export const getPolyline =  async (origin:any,destination:any,intermediates:any) => {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  
  const headers = {
    "X-Goog-FieldMask":"routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline"
  }
  


    const payload = {
        "origin":origin,
        "destination":destination,
        "intermediates":intermediates,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "departureTime": amanha.toISOString(),
        "computeAlternativeRoutes": false,
        "routeModifiers": {
          "avoidTolls": false,
          "avoidHighways": false,
          "avoidFerries": false
        },
        "languageCode": "en-US",
        "units": "IMPERIAL"
      }

      return await axios.post(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${process.env.GOOGLE_KEY}`,payload,{headers})
      .then(resp=>{
        return resp.data
      })
      .catch(e=>{
        console.log(e.response.data);
        return null
      })
};

function PilhaComRemocao() {
  this.pilha = [];

  this.push = function (elemento) {
    // Verifique se o elemento já está na pilha
    const indice = this.pilha.indexOf(elemento);

    if (indice !== -1) {
      // Se o elemento já está na pilha, remova-o
      this.pilha.splice(indice, 1);
    }

    // Adicione o novo elemento
    this.pilha.push(elemento);
  };

  this.pop = function () {
    if (this.pilha.length === 0) {
      return null; // Pilha vazia
    }

    return this.pilha.pop();
  };
}

const getDate =()=>{
  const data = new Date();
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // O mês é baseado em zero, por isso é necessário adicionar 1.
  const dia = data.getDate().toString().padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

@Injectable()
export class TripService {
  private static trips = new Map<number,object>();
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository : Repository<Trip>,
    
    @InjectRepository(Absence)
    private readonly absenceRepository : Repository<Absence>,

    
   
    private readonly userService : UsersService,

    private dataSource: DataSource,

    private readonly campusService : CampusesService
  ){}


  isGoing(trip:number){
    return TripService.trips.has(trip);
  }

  async startTrip (trip:number,coords:{latitude:number,longitude:number}) {
     const route = await this.getGoRoute(trip,coords);
     TripService.trips.set(trip,route);
     return route;
  }
  async getGoRoute(trip:number,coords:{latitude:number,longitude:number}){
    const passagenrs = await this.findOne(trip);
    const campuses = await this.campusService.findAll();

  const referenceLatitude = coords.latitude;
  const referenceLongitude = coords.longitude;
  const origin = {
    "location":{
      "latLng":{
        "latitude": referenceLatitude,
        "longitude": referenceLongitude
      }
    }
  }
  
  // Ordenar e formatar a lista de passageiros sem filtragem
  passagenrs.passengers.sort((passengerA, passengerB) => {
      const latitudeA = passengerA.passenger.address.latitude;
      const longitudeA = passengerA.passenger.address.longitude;
  
      const latitudeB = passengerB.passenger.address.latitude;
      const longitudeB = passengerB.passenger.address.longitude;
  
      const distanceA = calculateDistance(referenceLatitude, referenceLongitude, latitudeA, longitudeA);
      const distanceB = calculateDistance(referenceLatitude, referenceLongitude, latitudeB, longitudeB);
  
      return distanceA - distanceB;
  });
  
  // Formatar a lista no formato especificado
  const markers = [];
  const pilha = new PilhaComRemocao();
  const campusIndex = {};
  const route = passagenrs.passengers
      .filter(passenger => !passagenrs.absences.includes(String(passenger.passengerid)))
      .map((passenger,index) => {
      const latitude = passenger.passenger.address.latitude;
      const longitude = passenger.passenger.address.longitude;
      const campus = campuses.find(campus => campus.id === passenger.passenger.campus_id);
      pilha.push(campus.campus)
      campusIndex[campus.campus]={lastpassenger:index,address:campus.address_id}
      markers.push(
          {
          type:"passenger",
          location: {
              latLng: {
                  latitude: latitude,
                  longitude: longitude
              }
          }
      }
      );
      
      return {
          location: {
              latLng: {
                  latitude: latitude,
                  longitude: longitude
              }
          }
      };
  });
  
  Object.values(campusIndex).map(()=>{
      const item = campusIndex[pilha.pop()];
      markers.splice(item.lastpassenger+1, 0, {
          type:"campus",
          location: {
              latLng: {
                  latitude: item.address.latitude,
                  longitude: item.address.longitude
              }
          }
      });
      route.splice(item.lastpassenger+1, 0, {
          location: {
              latLng: {
                  latitude: item.address.latitude,
                  longitude: item.address.longitude
              }
          }
      });
  })

  const destination = route.pop();

  const polyline = await getPolyline(origin,destination,route)
  
  // Agora a lista de passageiros está ordenada pela distância em relação ao ponto de referência e no formato desejado
   return {markers:markers,polyline};


  }
  async getRoute(trip:number){
    const passagenrs = await this.findOne(trip);
    const campuses = await this.campusService.findAll();
    const absences = await Absence.getTripAbsence(this.dataSource,getDate(),trip);

  const referenceLatitude = passagenrs.passengers[0].passenger.address.latitude;
  const referenceLongitude = passagenrs.passengers[0].passenger.address.longitude;
  const origin = {
    "location":{
      "latLng":{
        "latitude": referenceLatitude,
        "longitude": referenceLongitude
      }
    }
  }
  
  // Ordenar e formatar a lista de passageiros sem filtragem
  passagenrs.passengers.sort((passengerA, passengerB) => {
      const latitudeA = passengerA.passenger.address.latitude;
      const longitudeA = passengerA.passenger.address.longitude;
  
      const latitudeB = passengerB.passenger.address.latitude;
      const longitudeB = passengerB.passenger.address.longitude;
  
      const distanceA = calculateDistance(referenceLatitude, referenceLongitude, latitudeA, longitudeA);
      const distanceB = calculateDistance(referenceLatitude, referenceLongitude, latitudeB, longitudeB);
  
      return distanceA - distanceB;
  });
  
  // Formatar a lista no formato especificado
  const markers = [];
  const pilha = new PilhaComRemocao();
  const campusIndex = {};
  const route = passagenrs.passengers
      .filter(passenger => !passagenrs.absences.includes(String(passenger.passengerid)))
      .map((passenger,index) => {
      const latitude = passenger.passenger.address.latitude;
      const longitude = passenger.passenger.address.longitude;
      const campus = campuses.find(campus => campus.id === passenger.passenger.campus_id);
      pilha.push(campus.campus)
      campusIndex[campus.campus]={
        lastpassenger:index,
        address:campus.address_id , 
        extraInfo:{
          name:campus.campus,
          //@ts-ignore
          bairro:campus.address_id.bairro,
          //@ts-ignore
          cidade:campus.address_id.cidade,
          //@ts-ignore
          complemento:campus.address_id.complemento,
          //@ts-ignore
          logradouro:campus.address_id.logradouro,
          //@ts-ignore
          pais:campus.address_id.pais,
          //@ts-ignore
          uf:campus.address_id.uf,
          //@ts-ignore
          numero:campus.address_id.numero,
        }}
      markers.push(
          {
          type:"passenger",
          location: {
              latLng: {
                  latitude: latitude,
                  longitude: longitude
              }
          },
          extraInfo:{
            name:passenger.passenger.user.name,
            photo: passenger.passenger.user.photo,
            google_account:passenger.passenger.user.google_account,
            bairro:passenger.passenger.address.bairro,
            cidade:passenger.passenger.address.cidade,
            complemento:passenger.passenger.address.complemento,
            logradouro:passenger.passenger.address.logradouro,
            pais:passenger.passenger.address.pais,
            uf:passenger.passenger.address.uf,
            numero:passenger.passenger.address.numero
          }
      }
      );
      
      return {
          location: {
              latLng: {
                  latitude: latitude,
                  longitude: longitude
              }
          }
      };
  });
  
  Object.values(campusIndex).map(()=>{
      const item = campusIndex[pilha.pop()];
      markers.splice(item.lastpassenger+1, 0, {
          type:"campus",
          location: {
              latLng: {
                  latitude: item.address.latitude,
                  longitude: item.address.longitude
              }
          },
          extraInfo:item.extraInfo
      });
      route.splice(item.lastpassenger+1, 0, {
          location: {
              latLng: {
                  latitude: item.address.latitude,
                  longitude: item.address.longitude
              }
          }
      });
  })

  const destination = route.pop();

  const polyline = await getPolyline(origin,destination,route)
  
  // Agora a lista de passageiros está ordenada pela distância em relação ao ponto de referência e no formato desejado
   return {markers:markers,polyline,absences};


  }

  async getPassengerAbsence(trip_id:number,user_id:number){
    const data = new Date();
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // O mês é baseado em zero, por isso é necessário adicionar 1.
    const dia = data.getDate().toString().padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;
    return await Absence.getPassengerAbsence(this.dataSource,dataFormatada,trip_id,user_id);
  }

  async findOne(id: number) {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // O mês é baseado em zero, por isso é necessário adicionar 1.
    const dia = data.getDate().toString().padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;

    const absences = await Absence.getTripAbsence(this.dataSource,dataFormatada,id);


    return await this.tripRepository.findOne({ 
      where: {
        trip_id: id,
      },
      relations:['passengers.passenger', 'passengers.passenger.user','passengers.passenger.address'],
      select:{
        passengers:{
        passenger:{
          user:{
            user_id:true,
            name:true,
            email:false,
            hashpassword:false,
            photo:true,
            phone:false,
            profile:false,
            google_account:true,
          },
      }},
    },
      relationLoadStrategy:"query",
    }).then(query=>({...query,absences:absences}))
    
  }
  
  async create(name: string, user_id: number, passengers?: { passengerid: number }[]) {
    const {driver} = await this.userService.getUserDriverInfo(user_id)
    const tripQuery = this.tripRepository.create({ name, driver: { driver_id :  driver.driver_id } });
    const trip = await this.tripRepository.save(tripQuery);
  
    if (passengers) {
      const a = passengers.map((item) => {
        return {
          passenger_trip_id: null, // Make sure this is not null if it's required in PassengerTrip
          trip: trip,
          passenger: {
            passenger_id: item.passengerid,
            user_id: undefined, // Provide the user_id and other required properties
            user: undefined,    // Make sure these match the structure of Passenger
            address_id: undefined,
            address: undefined,
            campus_id: undefined, // Add required properties
            campus: undefined,
            trips: undefined,
            absence: undefined,
            // Add other required properties here
          },
          passengerid: item.passengerid,
        };
      });

      this.dataSource.createQueryBuilder().insert().into("passengers_trips").values(a).execute();
       
    }
    return trip
  }
 }
