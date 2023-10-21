import { Injectable } from '@nestjs/common';
import { CreateTripDto } from '../../dto/create-trip.dto';
import { UpdateTripDto } from '../../dto/update-trip.dto';
import { Trip } from '../../entities/trip.entity';
import { Repository ,DataSource} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Absence } from '../../entities/absence.entity';
import { CampusesService } from 'src/campuses/campuses.service';
import axios from "axios"

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


@Injectable()
export class TripService {

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository : Repository<Trip>,

    private dataSource: DataSource,

    private readonly campusService : CampusesService
  ){}
  create(createTripDto: CreateTripDto) {
    return 'This action adds a new trip';
  }

  findAll() {
    return `This action returns all trip`;
  }

  async getRoute(trip:number){
    const passagenrs = await this.findOne(trip);
    const campuses = await this.campusService.findAll();
  
  // Coordenadas do ponto de referência
  const referenceLatitude = -23.6246797;
  const referenceLongitude = -46.5476174;
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
  const formattedPassengers = passagenrs.passengers
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
      formattedPassengers.splice(item.lastpassenger+1, 0, {
          location: {
              latLng: {
                  latitude: item.address.latitude,
                  longitude: item.address.longitude
              }
          }
      });
  })

  const destination = formattedPassengers.pop();

  const polyline = await getPolyline(origin,destination,formattedPassengers)
  
  // Agora a lista de passageiros está ordenada pela distância em relação ao ponto de referência e no formato desejado
   return {markers:markers,polyline};


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
  
  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
