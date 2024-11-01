import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import Expo from 'expo-server-sdk';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import {
  AcceptReservationRequestDto,
  DeclineReservationRequestDto,
  ExtendReservationDto,
  NewPublicReservationRequestDto,
  NewReservationDto,
  ReservationListDto,
  ReservationRequestDto,
  UpdateReservationDto,
} from 'src/core/entities/reservation/reservation.dto';
import { Result, fail, succeed } from 'src/config/http-response';
import { Reservation } from 'src/core/entities/reservation/reservation.entity';
import { codeGenerator, hasValue } from 'src/config/code-generator';
import {
  EReservationStatus,
  ISendPushNotifications,
  getReservationUpdateStatusMessage,
} from './reservations.helper';
import { formatDateToString, stringToFullDate } from '../helpers/date.helper';
import { __sendPushNotifications } from 'src/config/notifications';
import { EAccountType } from '../users/users.helper';
import { EDevise, EPlaceStatus } from '../places/places.helper';

@Injectable()
export class ReservationsService {
  constructor(private dataServices: IGenericDataServices) {}

  async create(value: NewReservationDto): Promise<Result> {
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
      const place = await this.dataServices.places.findOne(
        value.place,
        '_id code isDeleted company description house prices',
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
      const startDate = stringToFullDate(value.startDate);
      const endDate = value.endDate
        ? stringToFullDate(value.endDate)
        : startDate;
      const operationDate = new Date();
      const newReservation: Reservation = {
        code: codeGenerator('RES'),
        createdAt: operationDate,
        lastUpdatedAt: operationDate,
        status: EReservationStatus.ACCEPTED,
        user: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          tokenValue: value.tokenValue,
          identification: value.identification,
        },
        startDate,
        endDate,
        duration: value.duration,
        place: place['_id'],
        company: place.company,
        house: place.house,
        ...(hasValue(value.price) && {
          price: {
            description: '',
            devise: EDevise.FCFA,
            value: value.price,
          },
        }),
        ...(value.medias?.length && {
          medias: value.medias?.flatMap((o) => ({
            url: o.url,
            code: codeGenerator('MED'),
          })),
        }),
        createdBy: user['_id'],
        placeCurrentPrices: place.prices || [],
      };
      const createdReservation = await this.dataServices.reservations.create(
        newReservation,
      );
      await this.dataServices.places.update(place.code, {
        // currentStatus: EPlaceStatus.TAKEN,
        $addToSet: {
          reservations: createdReservation['_id'],
        },
      });
      this.__pushNotifications({
        client: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
        },
        companyId: place.company,
        houseId: place.house,
        authorAction: value.by,
        notificationType: 'Nouvelle Réservation',
        message: `Nouvelle réservation enregistrée au nom de: ${value.firstName} ${value.lastName}`,
      });
      return succeed({
        code: HttpStatus.OK,
        data: {
          status: EReservationStatus.ON_REQUEST,
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while registering new reservation. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(value: UpdateReservationDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(value.by, '-__v');
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'user not found!',
          error: 'Not found',
        });
      }
      if (user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This user is no longer active',
          error: 'Bad request',
        });
      }

      const reservation = await this.dataServices.reservations.findOne(
        value.reservation,
        '-__v',
      );
      if (!reservation) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'reservation not found!',
          error: 'Not found',
        });
      }
      if (reservation.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This reservation is no longer active',
          error: 'Bad request',
        });
      }
      if (reservation.status === EReservationStatus.ENDED) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This reservation is ended. You cannot updated it',
          error: 'Bad request',
        });
      }
      const place = await this.dataServices.places.findById(
        reservation.place as Types.ObjectId,
        '-__v',
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
      if (place.enterprise.toString() !== user.enterprise?.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const update = {
        lastUpdatedAt: new Date(),
        lastUpdatedBy: user['_id'],
        // status: value.status || reservation.status,
        duration: value.duration || reservation.duration,
        user: {
          firstName: value.firstName || reservation.user.firstName,
          lastName: value.lastName || reservation.user.lastName,
          phone: value.phone || reservation.user.phone,
          tokenValue: reservation.user.tokenValue,
        },
        startDate: value.startDate
          ? stringToFullDate(value.startDate)
          : reservation.startDate,
        endDate: value.endDate
          ? stringToFullDate(value.endDate)
          : reservation.endDate,
        realStartDate: value.realStartDate
          ? stringToFullDate(value.realStartDate)
          : reservation.realStartDate,
        realEndDate: value.realEndDate
          ? stringToFullDate(value.realEndDate)
          : reservation.realEndDate,
        price: value.price || reservation.price,
      };
      await this.dataServices.reservations.update(reservation.code, update);

      return succeed({
        code: HttpStatus.OK,
        data: {
          ...update,
          lastUpdatedBy: undefined,
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while updating reservation. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(filter: ReservationListDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        filter.by,
        '_id company account_type house',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'user not found!',
          error: 'Not found',
        });
      }
      if (user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This user is no longer active',
          error: 'Bad request',
        });
      }
      if (!user.company && user.account_type !== EAccountType.SUPER_ADMIN) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Bad request!',
          error: 'Bad request',
        });
      }
      let places = [];
      if (filter.places?.length) {
        places = await this.dataServices.places.findAllByCodes(
          filter.places,
          '_id',
        );
        if (!places.length) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'Places not found',
            error: 'Not found',
          });
        }
      }
      let house = null;
      if (filter.house) {
        house = await this.dataServices.houses.findOne(
          filter.house,
          '_id company',
        );
        if (!house) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'House not found',
            error: 'Not found',
          });
        }
        if (
          house.company.toString() !== user.company.toString() &&
          user.account_type !== EAccountType.SUPER_ADMIN
        ) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'House not found',
            error: 'Not found',
          });
        }
      }
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      const result = await this.dataServices.reservations.list({
        limit: limit,
        skip,
        status: filter.status,
        companiesId: user.company ? [user.company as Types.ObjectId] : [],
        placesId: places?.length ? places.flatMap((o) => o['_id']) : [],
        housesId: house ? [house['_id']] : [],
        ...(filter.searchTerm?.length && {
          searchTerm: filter.searchTerm,
        }),
      });
      if (!result.length) {
        return succeed({
          code: HttpStatus.BAD_REQUEST,
          message: '',
          data: { total: 0, reservations: [] },
        });
      }
      const total = result[0].total;
      const reservations = result.flatMap((i) => ({
        ...i.reservations,
        total: undefined,
        house: undefined,
      }));
      await this.dataServices.reservations.populateReservationInfos(
        reservations,
      );
      return succeed({
        code: HttpStatus.OK,
        message: '',
        data: { total, reservations },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting reservations. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async publicList(filter: ReservationListDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        filter.by,
        '_id company account_type house',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'user not found!',
          error: 'Not found',
        });
      }
      if (user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This user is no longer active',
          error: 'Bad request',
        });
      }
      let places = [];
      if (filter.places?.length) {
        places = await this.dataServices.places.findAllByCodes(
          filter.places,
          '_id',
        );
        if (!places.length) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'Places not found',
            error: 'Not found',
          });
        }
      }
      let house = null;
      if (filter.house) {
        house = await this.dataServices.houses.findOne(
          filter.house,
          '_id company',
        );
        if (!house) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'House not found',
            error: 'Not found',
          });
        }
        if (
          house.company.toString() !== user.company.toString() &&
          user.account_type !== EAccountType.SUPER_ADMIN
        ) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            message: 'House not found',
            error: 'Not found',
          });
        }
      }
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      const result = await this.dataServices.reservations.list({
        limit: limit,
        skip,
        status: filter.status,
        companiesId: user.company ? [user.company as Types.ObjectId] : [],
        placesId: places?.length ? places.flatMap((o) => o['_id']) : [],
        housesId: house ? [house['_id']] : [],
        ...(filter.searchTerm?.length && {
          searchTerm: filter.searchTerm,
        }),
        userPhone: filter.phoneNumber,
        userCountryCode: filter.countryCode,
      });
      if (!result.length) {
        return succeed({
          code: HttpStatus.BAD_REQUEST,
          message: '',
          data: { total: 0, reservations: [] },
        });
      }
      const total = result[0].total;
      const reservations = result.flatMap((i) => ({
        ...i.reservations,
        total: undefined,
        house: undefined,
      }));
      await this.dataServices.reservations.populateReservationInfos(
        reservations,
      );
      return succeed({
        code: HttpStatus.OK,
        message: '',
        data: { total, reservations },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting reservations. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reservationRequest(value: ReservationRequestDto): Promise<Result> {
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
      const place = await this.dataServices.places.findOne(
        value.place,
        '_id code isDeleted company description house prices',
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
      const startDate = stringToFullDate(value.startDate);
      const endDate = value.endDate
        ? stringToFullDate(value.endDate)
        : startDate;
      const operationDate = new Date();
      const newReservation: Reservation = {
        code: codeGenerator('RES'),
        createdAt: operationDate,
        lastUpdatedAt: operationDate,
        status: EReservationStatus.ON_REQUEST,
        user: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          tokenValue: value.tokenValue,
          identification: value.identification,
        },
        startDate,
        endDate,
        duration: value.duration,
        place: place['_id'],
        company: place.company,
        house: place.house,
        ...(hasValue(value.price) && {
          price: {
            description: '',
            devise: EDevise.FCFA,
            value: value.price,
          },
        }),
        createdBy: user['_id'],
        placeCurrentPrices: place.prices || [],
      };
      const createdReservationRequest =
        await this.dataServices.reservations.create(newReservation);
      await this.dataServices.places.update(place.code, {
        $addToSet: {
          reservationsRequests: createdReservationRequest['_id'],
        },
      });
      this.__pushNotifications({
        client: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
        },
        companyId: place.company,
        houseId: place.house,
        authorAction: value.by,
        notificationType: 'Demande de réservation',
        message: `Nouvelle demande de réservation au nom de: ${value.firstName} ${value.lastName}`,
      });
      return succeed({
        code: HttpStatus.OK,
        data: {
          status: EReservationStatus.ON_REQUEST,
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while registering new reservation request. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async publicReservationRequest(
    value: NewPublicReservationRequestDto,
  ): Promise<Result> {
    try {
      const place = await this.dataServices.places.findOne(
        value.place,
        '_id code isDeleted company description house prices',
      );
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'place not found!',
          error: 'Not found',
        });
      }
      // if (place.isDeleted) {
      //   return fail({
      //     code: HttpStatus.BAD_REQUEST,
      //     message: 'This place is no longer active',
      //     error: 'Bad request',
      //   });
      // }
      const startDate = stringToFullDate(value.startDate);
      const endDate = value.endDate
        ? stringToFullDate(value.endDate)
        : startDate;
      const operationDate = new Date();
      const newReservation: Reservation = {
        code: codeGenerator('RES'),
        createdAt: operationDate,
        lastUpdatedAt: operationDate,
        status: EReservationStatus.ON_REQUEST,
        user: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          tokenValue: value.tokenValue,
          identification: value.identification,
        },
        startDate,
        endDate,
        duration: value.duration,
        place: place['_id'],
        company: place.company,
        house: place.house,
        ...(hasValue(value.price) && {
          price: {
            description: '',
            devise: EDevise.FCFA,
            value: value.price,
          },
        }),
        isPublicRequest: true,
        placeCurrentPrices: place.prices || [],
      };
      const createdReservationRequest =
        await this.dataServices.reservations.create(newReservation);
      await this.dataServices.places.update(place.code, {
        $addToSet: {
          reservationsRequests: createdReservationRequest['_id'],
        },
      });
      this.__pushNotifications({
        client: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
        },
        companyId: place.company,
        houseId: place.house,
        authorAction: null,
        notificationType: 'NOOYAL• Demande de réservation',
        message: `NOOYAL • Demande de réservation au nom de: ${value.firstName} ${value.lastName}`,
      });
      return succeed({
        code: HttpStatus.OK,
        data: {
          status: EReservationStatus.ON_REQUEST,
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while registering new reservation request. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptReservationRequest(
    value: AcceptReservationRequestDto,
  ): Promise<Result> {
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
      const reservation = await this.dataServices.reservations.findOne(
        value.reservation,
        '-__v',
      );
      if (reservation.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Reservation not found',
          error: 'Bad request',
        });
      }
      if (
        ![EReservationStatus.ON_REQUEST, EReservationStatus.ACCEPTED].includes(
          reservation.status,
        )
      ) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot accept a reservation with the status: ${reservation.status}`,
          error: 'Bad request',
        });
      }
      if (reservation.company.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot do this action`,
          error: 'Bad request',
        });
      }
      const place = await this.dataServices.places.findById(
        reservation.place,
        '_id code house company currentStatus',
      );
      const operationDate = new Date();
      if (value.start) {
        if (place.currentStatus === EPlaceStatus.TAKEN) {
          return fail({
            code: HttpStatus.BAD_REQUEST,
            error:
              'This room is occupied. You must end the current reservation before starting a new one.',
            message:
              'This room is occupied. You must end the current reservation before starting a new one.',
          });
        }
        await Promise.all([
          this.dataServices.places.update(place.code, {
            currentStatus: EPlaceStatus.TAKEN,
            reservation: reservation['_id'],
            $addToSet: {
              reservations: reservation['_id'],
            },
          }),
          this.dataServices.reservations.update(reservation.code, {
            status: EReservationStatus.IN_PROGRESS,
            realStartDate: operationDate,
            lastUpdatedAt: operationDate,
            lastUpdatedBy: user['_id'],
            user: {
              ...reservation.user,
              identification:
                value.identification || reservation.user.identification,
            },
            price: {
              ...reservation.price,
              value: value.price || reservation.price.value,
            },
            ...(value.medias?.length && {
              medias: value.medias?.flatMap((o) => ({
                url: o.url,
                code: codeGenerator('MED'),
              })),
            }),
          }),
        ]);
        this.__pushNotifications({
          client: {
            firstName: reservation.user.firstName,
            lastName: reservation.user.lastName,
            phone: reservation.user.phone,
          },
          companyId: place.company,
          houseId: place.house,
          authorAction: value.by,
          notificationType: 'Réservation démarrée.',
          message: `Réservation démarrée au nom de: ${reservation.user.firstName} ${reservation.user.lastName}`,
        });
      } else {
        await this.dataServices.reservations.update(reservation.code, {
          status: EReservationStatus.ACCEPTED,
          lastUpdatedAt: new Date(),
          lastUpdatedBy: user['_id'],
        });
        this.__pushNotifications({
          client: {
            firstName: reservation.user.firstName,
            lastName: reservation.user.lastName,
            phone: reservation.user.phone,
          },
          companyId: place.company,
          houseId: place.house,
          authorAction: value.by,
          notificationType: 'Demande de réservation acceptée.',
          message: `Réservation acceptée au nom de: ${reservation.user.firstName} ${reservation.user.lastName}`,
        });
      }
      return succeed({
        data: {},
        message: 'Reservation started.',
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while accepting reservation request. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async declineReservationRequest(
    value: DeclineReservationRequestDto,
  ): Promise<Result> {
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
      const reservation = await this.dataServices.reservations.findOne(
        value.reservation,
        '-__v',
      );
      if (reservation.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Reservation not found',
          error: 'Bad request',
        });
      }
      if (reservation.status === EReservationStatus.IN_PROGRESS) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot cancel a reservation with the status: ${reservation.status}`,
          error: 'Bad request',
        });
      }
      if (reservation.company.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot do this action`,
          error: 'Bad request',
        });
      }
      const place = await this.dataServices.places.findById(
        reservation.place,
        '_id code house company',
      );
      await Promise.all([
        this.dataServices.reservations.update(reservation.code, {
          status: EReservationStatus.CANCELLED,
          lastUpdatedAt: new Date(),
          lastUpdatedBy: user['_id'],
        }),
      ]);
      /******* NOTIFICATIONS ***************/
      this.__pushNotifications({
        client: {
          firstName: reservation.user.firstName,
          lastName: reservation.user.lastName,
          phone: reservation.user.phone,
        },
        companyId: place.company,
        houseId: place.house,
        authorAction: value.by,
        notificationType: 'Réservation annulée',
        message: `Réservation annulée pour: ${reservation.user.firstName} ${reservation.user.lastName}`,
      });
      /****** NOTIFICATIONS ***************/
      return succeed({
        data: {},
        message: 'Reservation aborted.',
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while accepting reservation request. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async extendReservation(value: ExtendReservationDto): Promise<Result> {
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
      const reservation = await this.dataServices.reservations.findOne(
        value.reservation,
        '-__v',
      );
      if (reservation.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Reservation not found',
          error: 'Bad request',
        });
      }
      if (reservation.status !== EReservationStatus.IN_PROGRESS) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot extend this reservation. It's already finished.`,
          error: 'Bad request',
        });
      }
      if (reservation.company.toString() !== user.company.toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: `You cannot do this action`,
          error: 'Bad request',
        });
      }
      // const operationDate = new Date();
      // const newReservation: Reservation = {
      //   code: codeGenerator('RES'),
      //   createdAt: operationDate,
      //   lastUpdatedAt: operationDate,
      //   status: EReservationStatus.ACCEPTED,
      //   user: {
      //     firstName: reservation.user.firstName,
      //     lastName: reservation.user.lastName,
      //     phone: reservation.user.phone,
      //     tokenValue: reservation.user.tokenValue,
      //     identification: reservation.user.identification,
      //   },
      //   startDate: operationDate,
      //   endDate: stringToFullDate(value.endDate),
      //   duration: reservation.duration,
      //   place: reservation['_id'],
      //   company: reservation.company,
      //   house: reservation.house,
      //   price: {
      //     description: '',
      //     devise: EDevise.FCFA,
      //     value: value.price,
      //   },
      // };
      // const [createdReservation] = await Promise.all([
      //   this.dataServices.reservations.create(
      //     newReservation,
      //   ),
      //   this.dataServices.reservations.update(reservation.code, {
      //     status: EReservationStatus.ENDED,
      //     realEndDate: operationDate,
      //     lastUpdatedAt: operationDate,
      //     lastUpdatedBy: user['_id'],
      //   }),
      // ]);
      const endDate = stringToFullDate(value.endDate);
      await this.dataServices.reservations.update(reservation.code, {
        endDate,
        price: {
          description: '',
          devise: EDevise.FCFA,
          value: value.price,
        },
        isExtended: true,
        lastUpdatedAt: new Date(),
        lastUpdatedBy: user['_id'],
      });
      this.__pushNotifications({
        client: {
          firstName: reservation.user.firstName,
          lastName: reservation.user.lastName,
          phone: reservation.user.phone,
        },
        companyId: reservation.company,
        houseId: reservation.house,
        authorAction: value.by,
        notificationType: 'Réservation prolongée.',
        message: `Prolongation de réservation pour : ${
          reservation.user.firstName
        } ${reservation.user.lastName}. Jusqu'au ${formatDateToString(
          endDate,
        )} à ${endDate.getHours()}:${endDate.getMinutes()}`,
      });
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while extending reservation. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async __pushNotifications({
    companyId,
    houseId,
    authorAction,
    client,
    notificationType,
    message,
  }: ISendPushNotifications) {
    try {
      console.log({ companyId });
      const [users, company, house] = await Promise.all([
        this.dataServices.users.findUsersByCompany(
          companyId as Types.ObjectId,
          '_id code push_tokens account_type firstName company house isDeleted isActive',
        ),
        this.dataServices.companies.findById(
          companyId as Types.ObjectId,
          '_id code name',
        ),
        this.dataServices.houses.findById(
          houseId as Types.ObjectId,
          '_id code name',
        ),
      ]);
      console.log({ users });
      const messages = [];
      for (const user of users) {
        if (!user.isDeleted && user.isActive) {
          //user.code !== authorAction
          let mustReceiveNotification = false;
          if (
            user.account_type === EAccountType.ADMIN ||
            (user.account_type === EAccountType.SUPERVISOR &&
              user.house?.toString() === houseId.toString())
          ) {
            mustReceiveNotification = true;
          }
          // else {
          //   console.log(`user house ${ user.house?.toString()} --- house: ${houseId.toString()}`)
          // }

          if (mustReceiveNotification) {
            for (const pushToken of user.push_tokens) {
              if (!Expo.isExpoPushToken(pushToken)) continue;
              messages.push({
                to: pushToken,
                sound: 'default',
                title: `${company.name} • ${house.name}`,
                subtitle: notificationType,
                body: `${message}`,
                data: { withSome: `${client.phone}` },
              });
            }
          }
        }
      }
      __sendPushNotifications(messages);
    } catch (error) {
      console.log({ error });
    }
  }
}
