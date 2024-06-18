import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import Expo from 'expo-server-sdk';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import {
  NewReservationDto,
  ReservationListDto,
  UpdateReservationDto,
} from 'src/core/entities/reservation/reservation.dto';
import { Result, fail, succeed } from 'src/config/http-response';
import { Reservation } from 'src/core/entities/reservation/reservation.entity';
import { codeGenerator, hasValue } from 'src/config/code-generator';
import {
  EReservationStatus,
  getReservationUpdateStatusMessage,
} from './reservations.helper';
import { stringToDate, stringToFullDate } from '../helpers/date.helper';
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
        '_id code isDeleted company description house',
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
      const operationDate = new Date();
      const newReservation: Reservation = {
        code: codeGenerator('RES'),
        createdAt: operationDate,
        lastUpdatedAt: operationDate,
        status: EReservationStatus.IN_PROGRESS,
        user: {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          tokenValue: value.tokenValue,
          identification: value.identification,
        },
        startDate: operationDate, //stringToDate(value.startDate),
        // endDate: value.endDate ? stringToDate(value.endDate) : null,
        // duration: value.duration,
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
      };
      const createdReservation = await this.dataServices.reservations.create(
        newReservation,
      );
      await this.dataServices.places.update(place.code, {
        currentStatus: EPlaceStatus.TAKEN,
        $addToSet: {
          reservations: createdReservation['_id'],
        },
      });

      /*******NOTIFICATIONS ***************/
      const [users, company, house] = await Promise.all([
        this.dataServices.users.findUsersByCompany(
          place.company as Types.ObjectId,
          '_id code push_tokens account_type firstName company house',
        ),
        this.dataServices.companies.findById(
          place.company as Types.ObjectId,
          '_id code name',
        ),
        this.dataServices.houses.findById(
          place.house as Types.ObjectId,
          '_id code name',
        ),
      ]);
      const messages = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].code === value.by) {
          let mustReceiveNotification = false;
          if (users[i].account_type === EAccountType.ADMIN) {
            mustReceiveNotification = true;
          } else if (
            users[i].account_type === EAccountType.SUPERVISOR &&
            users[i].house?.toString() === place.house.toString()
          ) {
            mustReceiveNotification = true;
          }
          const user = users[i];
          if (mustReceiveNotification) {
            for (let j = 0; j < user.push_tokens.length; j++) {
              const pushToken = user.push_tokens[j];
              if (!Expo.isExpoPushToken(pushToken)) continue;
              messages.push({
                to: pushToken,
                sound: 'default',
                title: `${company.name} • ${house.name}`,
                body: `Nouvelle reservation au nom de: ${value.firstName} ${value.lastName}`,
                data: { withSome: `${value.phone}` },
              });
            }
          }
        }
      }
      __sendPushNotifications(messages);
      /*******NOTIFICATIONS ***************/
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
        status: value.status || reservation.status,
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
      //   if (
      //     value.status &&
      //     reservation.user.tokenValue &&
      //     Expo.isExpoPushToken(reservation.user.tokenValue)
      //   ) {
      //     const messages = [];
      //     messages.push({
      //       to: reservation.user.tokenValue,
      //       sound: 'default',
      //       title: `Heberease • Réservation`,
      //       body: getReservationUpdateStatusMessage(value.status),
      //       data: { withSome: `${value.phone}` },
      //     });
      //     __sendPushNotifications(messages);
      //   }

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
        '_id enterprise accountType',
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
      if (!user.enterprise && user.accountType !== EAccountType.SUPER_ADMIN) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Bas request!',
          error: 'Bad request',
        });
      }
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      const result = await this.dataServices.reservations.list({
        limit: limit,
        skip,
        status: filter.status,
        enterprisesId: user.enterprise
          ? [user.enterprise as Types.ObjectId]
          : [],
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
}
