import { Types } from 'mongoose';
import { Medias } from '../entities/places/place-media.entity';
import { IPlaceList, IPlaceListByCompany } from 'src/features/places/places.helper';
import { IPlaceCAAmount, IReservationList, IReservationRecap, IReservationsByPlace } from 'src/features/reservations/reservations.helper';
import { IHouseList } from 'src/features/houses/houses.helper';
import { IUsersList } from 'src/features/users/users.helper';

export abstract class IGenericRepository<T> {
  abstract findAll(filterAttributes: string): Promise<T[]>;

  abstract findOne(code: string, filterAttributes: string): Promise<T>;

  abstract create(item: T): Promise<T>;

  abstract update(code: string, update: any): Promise<T>;

  abstract updateWithFilterObject(filter: any, update: any): Promise<T>;

  abstract findAllByCodes(
    codes: string[],
    filterAttributes: string,
  ): Promise<T[]>;
}

export abstract class IUserRepository<T> {
  abstract findUsersByCompany(
    company: Types.ObjectId,
    filterAttributes: string,
  ): Promise<any[]>;
  abstract authentication(phone: string, password: string): Promise<T>;
  abstract updatePushTokens(code: string, pushtoken: string): Promise<T>;
  abstract removePushTokens(code: string, pushtoken: string): Promise<T>;
  abstract list(filter: IUsersList): Promise<any[]>
}

export abstract class ICompanyRepository<T> {
  abstract linkHousesToCompany(
    houses: Types.ObjectId[],
    idCompany: Types.ObjectId,
  ): Promise<T>;

  abstract unlinkHousesToCompany(
    houses: Types.ObjectId[],
    idCompany: Types.ObjectId,
  ): Promise<T>;
}

export abstract class IHouseRepository<T> {
  abstract linkPlacesToHouse(
    places: Types.ObjectId[],
    idHouse: Types.ObjectId,
  ): Promise<T>;

  abstract unlinkPlacesToHouse(
    places: Types.ObjectId[],
    idHouse: Types.ObjectId,
  ): Promise<T>;

  abstract list(filter: IHouseList): Promise<any[]>;
}

export abstract class IPlaceRepository<T> {
  abstract linkMediasToPlace(
    medias: Medias[],
    idPlace: Types.ObjectId,
  ): Promise<T>;

  abstract unLinkMediasToPlace(
    medias: Medias[],
    idPlace: Types.ObjectId,
  ): Promise<T>;

  abstract list(filter: IPlaceList): Promise<any[]>;
  abstract populatePlaceInfos(value: any): Promise<any>;

  abstract getPlacesByCompany(filter: IPlaceListByCompany): Promise<any[]>
}

export abstract class IReservationRepository<T> {
  abstract list(filter: IReservationList): Promise<any[]>;
  abstract populateReservationInfos(value: any): Promise<any>;
  abstract getReservationsByPlace(filter: IReservationsByPlace): Promise<any[]>;
  abstract getPlaceTotalAmount(filter: IPlaceCAAmount): Promise<any[]>;
  abstract getRecap(filter: IReservationRecap): Promise<any[]>;
}
