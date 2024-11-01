import { Company } from '../entities/companies/companies.entity';
import { Favorite } from '../entities/favorites/favorites.entity';
import { House } from '../entities/houses/houses.entity';
import { Place } from '../entities/places/places.entity';
import { Reservation } from '../entities/reservation/reservation.entity';
import { User } from '../entities/users/user.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { FavoriteRepository } from '../repositories/favorite.repository';
import { HouseRepository } from '../repositories/house.repository';
import { PlaceRepository } from '../repositories/place.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { UserRepository } from '../repositories/user.repository';

export abstract class IGenericDataServices {
  abstract users: UserRepository<User>;
  abstract companies: CompanyRepository<Company>;
  abstract places: PlaceRepository<Place>;
  abstract houses: HouseRepository<House>;
  abstract reservations: ReservationRepository<Reservation>;
  abstract favorites: FavoriteRepository<Favorite>;
}
