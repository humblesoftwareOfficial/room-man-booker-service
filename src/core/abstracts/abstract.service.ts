import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IGenericDataServices } from '../generics/generic-data.services';
import { User } from '../entities/users/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { Model } from 'mongoose';
import { Company } from '../entities/companies/companies.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { Place } from '../entities/places/places.entity';
import { PlaceRepository } from '../repositories/place.repository';
import { House } from '../entities/houses/houses.entity';
import { HouseRepository } from '../repositories/house.repository';
import { Reservation } from '../entities/reservation/reservation.entity';
import { ReservationRepository } from '../repositories/reservation.repository';

@Injectable()
export class MongoDataServices
  implements IGenericDataServices, OnApplicationBootstrap
{
  users: UserRepository<User>;
  companies: CompanyRepository<Company>;
  places: PlaceRepository<Place>;
  houses: HouseRepository<House>;
  reservations: ReservationRepository<Reservation>;
  
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<User>,
    @InjectModel(Company.name)
    private companyRepository: Model<Company>,
    @InjectModel(House.name)
    private houseRepository: Model<House>,
    @InjectModel(Place.name)
    private placeRepository: Model<Place>,
    @InjectModel(Reservation.name)
    private reservationRepository: Model<Reservation>,
  ) {}
  
  onApplicationBootstrap() {
    this.users = new UserRepository<User>(this.userRepository);
    this.companies = new CompanyRepository<Company>(this.companyRepository);
    this.houses = new HouseRepository<House>(this.houseRepository);
    this.places = new PlaceRepository<Place>(this.placeRepository);
    this.reservations = new ReservationRepository<Reservation>(this.reservationRepository);
  }
}
