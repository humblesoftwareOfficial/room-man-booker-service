import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { codeGenerator } from 'src/config/code-generator';
import { Result, succeed, fail } from 'src/config/http-response';
import {
  AddMediasDto,
  GetReservationsByPlaceDto,
  GetStatsByCompany,
  NewPlaceDto,
  PlaceListDto,
  UpdatePlaceDto,
} from 'src/core/entities/places/places.dto';
import { Place } from 'src/core/entities/places/places.entity';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import { stringToDate } from '../helpers/date.helper';
import { EPlaceStatus } from './places.helper';
import { EReservationStatus } from '../reservations/reservations.helper';

@Injectable()
export class PlacesService {
  constructor(private dataServices: IGenericDataServices) {}

  async create(value: NewPlaceDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        value.by,
        '_id code company isDeleted isActive',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found!',
          error: 'Not found!',
        });
      }
      if (!user.isActive || user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This account is no longer active',
          error: 'Bad request',
        });
      }
      if (!user.company) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const house = await this.dataServices.houses.findOne(
        value.house,
        '_id code company position isDeleted',
      );
      if (!house) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'House not found',
          error: 'Not found!',
        });
      }
      if (house.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This house is no longer active',
          error: 'Bad request',
        });
      }
      if (house.company.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const company = await this.dataServices.companies.findById(
        user.company as Types.ObjectId,
        '_id code isDeleted',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'Company not found',
          error: 'Not found!',
        });
      }
      if (company.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This company is no longer active',
          error: 'Bad request',
        });
      }
      const operationDate = new Date();
      const newPlace: Place = {
        code: codeGenerator('PLA'),
        createdAt: operationDate,
        lastUpdatedAt: operationDate,
        createdBy: user['_id'],
        lastUpdatedBy: user['_id'],
        label: value.label,
        description: value.description,
        prices: value.prices,
        company: company['_id'],
        star: value.star,
        position: house.position,
        properties: value.properties,
        type: value.type,
        medias: value.medias?.flatMap((o) => ({
          url: o.url,
          code: codeGenerator('MED'),
        })),
        house: house['_id']
      };
      const createdPlace = await this.dataServices.places.create(newPlace);
      await this.dataServices.houses.linkPlacesToHouse([createdPlace['_id']], house['_id']);
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while creating new place. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addMedias(value: AddMediasDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        value.by,
        '_id code company isDeleted',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not found!',
        });
      }
      if (user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This account is no longer active',
          error: 'Bad request',
        });
      }
      if (!user.company) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const company = await this.dataServices.companies.findById(
        user.company as Types.ObjectId,
        '_id code isDeleted',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'Company not found',
          error: 'Not found!',
        });
      }
      if (company.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This company is no longer active',
          error: 'Bad request',
        });
      }
      const place = await this.dataServices.places.findOne(
        value.place,
        '_id code isDeleted company',
      );
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'place not found!',
          error: 'Not found',
        });
      }
      if (place.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This place is no longer active',
          error: 'Bad request',
        });
      }
      if (place.company?.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const medias = value.medias.flatMap((m) => ({
        url: m.url,
        code: codeGenerator('MED'),
      }));
      const operationDate = new Date();
      const update = {
        lastUpdatedAt: operationDate,
        lastUpdatedBy: user['_id'],
        $addToSet: {
          medias: { $each: medias },
        },
      };
      await this.dataServices.places.update(place.code, update);
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      throw new HttpException(
        `Error while adding new medias on place. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(value: UpdatePlaceDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        value.by,
        '_id code company isDeleted',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not found!',
        });
      }
      if (user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This account is no longer active',
          error: 'Bad request',
        });
      }
      if (!user.company) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const company = await this.dataServices.companies.findById(
        user.company as Types.ObjectId,
        '_id code isDeleted',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'Company not found',
          error: 'Not found!',
        });
      }
      if (company.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This enterprise is no longer active',
          error: 'Bad request',
        });
      }
      const place = await this.dataServices.places.findOne(value.place, '-__v');
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'place not found!',
          error: 'Not found',
        });
      }
      if (place.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This place is no longer active',
          error: 'Bad request',
        });
      }
      if (place.company?.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const operationDate = new Date();
      const update = {
        description: value.description || place.description,
        label: value.label || place.label,
        ...(value.isAvailable !== null &&
          value.isAvailable !== undefined && {
            isAvailable: value.isAvailable,
          }),
          ...(value.currentStatus !== null &&
            value.currentStatus !== undefined && {
              currentStatus: value.currentStatus,
            }),
        ...(value.isOnTop !== null &&
          value.isOnTop !== undefined && {
            isOnTop: value.isOnTop,
          }),
        ...(value.isDeleted !== null &&
          value.isDeleted !== undefined && {
            isDeleted: value.isDeleted,
          }),
        properties: value.properties || place.properties,
        prices: value.prices || place.prices,
        position: value.position || place.position,
        type: value.type || place.type,
        star: value.star || place.star,
        lastUpdatedAt: operationDate,
        lastUpdatedBy: user['_id'],
        ...(value.currentStatus === EPlaceStatus.AVAILABLE && {
          reservation: null,
        })
      };
      await this.dataServices.places.update(place.code, update);
      if (value.currentStatus === EPlaceStatus.AVAILABLE) {
        await this.dataServices.reservations.updateWithFilterObject({
          place: place['_id'],
          status: EReservationStatus.IN_PROGRESS,
        }, {
          status: EReservationStatus.ENDED,
          realEndDate: operationDate,
          lastUpdatedAt: operationDate,
          lastUpdatedBy: user['_id']
        })
      }
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      throw new HttpException(
        `Error while updating place. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(filter: PlaceListDto): Promise<Result> {
    try {
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      let companiesId = [];
      let housesId = [];
      if (filter.companies?.length) {
        const companies = await this.dataServices.companies.findAllByCodes(
          filter.companies,
          '_id',
        );
        companiesId = companies.flatMap((o) => o['_id']);
      }
      if (filter.houses?.length) {
        const houses = await this.dataServices.houses.findAllByCodes(
          filter.houses,
          '_id',
        );
        housesId = houses.flatMap((o) => o['_id']);
      }
      const result = await this.dataServices.places.list({
        limit: limit,
        skip,
        searchTerm: filter.searchTerm,
        types: filter.types,
        properties: filter.properties,
        maxPrice: filter.maxPrice,
        minPrice: filter.minPrice,
        companies: companiesId,
        houses: housesId,
        isOnTop: filter.isOnTop,
        isAvailable: filter.isAvailable,
      });
      if (!result.length) {
        return succeed({
          code: HttpStatus.BAD_REQUEST,
          message: '',
          data: { total: 0, places: [] },
        });
      }
      const total = result[0].total;
      const places = result.flatMap((i) => ({
        ...i.places,
        total: undefined,
      }));
      await this.dataServices.places.populatePlaceInfos(places);
      return succeed({
        code: HttpStatus.OK,
        message: '',
        data: { total, places },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting places. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(code: string): Promise<Result> {
    try {
      const place = await this.dataServices.places.findOne(code, '-__v');
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'Place not found',
          message: "Place not found",
        })
      }
      const [_, reservationsCA] = await Promise.all([
        this.dataServices.places.populatePlaceInfos(place), 
        this.dataServices.reservations.getPlaceTotalAmount({
          places: [place['_id']],
        })
      ]);
      const data = {
        ...place,
        _id: undefined,
      }
      return succeed({
        data: {
          ...data,
          reservations: place.reservations?.length || 0,
          reservationsCA: reservationsCA?.length ? reservationsCA[0] : { amount: 0 },
        },
        message: ""
      })
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting place infos. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async getReservationsByPlace(
  //   value: GetReservationsByPlaceDto,
  // ): Promise<Result> {
  //   try {
  //     const user = await this.dataServices.users.findOne(
  //       value.by,
  //       '_id code company isDeleted',
  //     );
  //     if (!user) {
  //       return fail({
  //         code: HttpStatus.NOT_FOUND,
  //         message: 'User not found',
  //         error: 'Not found!',
  //       });
  //     }
  //     if (user.isDeleted) {
  //       return fail({
  //         code: HttpStatus.BAD_REQUEST,
  //         message: 'This account is no longer active',
  //         error: 'Bad request',
  //       });
  //     }
  //     if (!user.company) {
  //       return fail({
  //         code: HttpStatus.BAD_REQUEST,
  //         message: 'You cannot do this action',
  //         error: 'Bad request',
  //       });
  //     }
  //     const company = await this.dataServices.companies.findById(
  //       user.company as Types.ObjectId,
  //       '_id code isDeleted',
  //     );
  //     if (!company) {
  //       return fail({
  //         code: HttpStatus.NOT_FOUND,
  //         message: 'Enterprise not found',
  //         error: 'Not found!',
  //       });
  //     }
  //     if (company.isDeleted) {
  //       return fail({
  //         code: HttpStatus.BAD_REQUEST,
  //         message: 'This enterprise is no longer active',
  //         error: 'Bad request',
  //       });
  //     }
  //     const place = await this.dataServices.places.findOne(
  //       value.place,
  //       '_id enterprise',
  //     );
  //     if (!place) {
  //       return fail({
  //         code: HttpStatus.NOT_FOUND,
  //         message: 'place not found!',
  //         error: 'Not found',
  //       });
  //     }
  //     if (place.isDeleted) {
  //       return fail({
  //         code: HttpStatus.BAD_REQUEST,
  //         message: 'This place is no longer active',
  //         error: 'Bad request',
  //       });
  //     }
  //     if (place.enterprise?.toString() !== user.enterprise.toString()) {
  //       return fail({
  //         code: HttpStatus.BAD_REQUEST,
  //         message: 'You cannot do this action',
  //         error: 'Bad request',
  //       });
  //     }
  //     const startDate = value.startDate ? stringToDate(value.startDate) : null;
  //     const endDate = value.endDate ? stringToDate(value.endDate) : null;
  //     const reservations =
  //       await this.dataServices.reservation.getReservationsByPlace({
  //         placeId: place['_id'],
  //         startDate,
  //         endDate,
  //       });
  //     return succeed({
  //       code: HttpStatus.OK,
  //       data: {
  //         reservations,
  //       },
  //     });
  //   } catch (error) {
  //     console.log({ error });
  //     throw new HttpException(
  //       `Error while getting infos. Try again.`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
