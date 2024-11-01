import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../entities/users/user.entity';
import { IGenericDataServices } from '../generics/generic-data.services';
import { MongoDataServices } from './abstract.service';
import { Company, CompanySchema } from '../entities/companies/companies.entity';
import { Place, PlaceSchema } from '../entities/places/places.entity';
import {
  Reservation,
  ReservationSchema,
} from '../entities/reservation/reservation.entity';
import { House, HouseSchema } from '../entities/houses/houses.entity';
import { Favorite, FavoriteSchema } from '../entities/favorites/favorites.entity';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: House.name, schema: HouseSchema },
      { name: Place.name, schema: PlaceSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  providers: [
    {
      provide: IGenericDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IGenericDataServices],
})
export class AbstractMongoModule {}
