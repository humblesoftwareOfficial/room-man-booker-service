/* eslint-disable prettier/prettier */

import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
export const isValidReservationCode = (code: string) =>
  code && code.length === 23 && code.includes('RES-');

export const isValidReservationStatusEnum = (value: any) =>
  value in EReservationStatus;

@ValidatorConstraint({ name: 'ReservationCodeValidator', async: false })
export class ReservationCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidReservationCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid Reservation code.';
  }
}

@ValidatorConstraint({ name: 'ArrayReservationStatusValidator', async: false })
export class ArrayReservationStatusValidator
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(roles: string[], _args: ValidationArguments) {
    let isValidArray = true;
    for (const name of roles) {
      if (!isValidReservationStatusEnum(name)) {
        isValidArray = false;
        break;
      }
    }
    return isValidArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Types array must contain only valid reservation status.';
  }
}

export enum EReservationStatus {
  ON_REQUEST = 'ON_REQUEST',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED',
}

export interface IReservationList {
  status?: EReservationStatus[];
  skip: number;
  limit: number;
  companiesId?: Types.ObjectId[];
  placesId?: Types.ObjectId[];
}

export enum EReservationDuration {
  DAY = 'DAY',
  HALF_DAY = 'HALF_DAY',
  NIGHT = 'NIGHT',
  LONG_TIME = 'LONG_TIME',
}

export interface IReservationsByPlace {
  placeId: Types.ObjectId[];
  status?: EReservationStatus[];
  startDate?: Date;
  endDate?: Date;
}

export interface IPlaceCAAmount {
  places: Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
}

export const getReservationUpdateStatusMessage = (
  status: EReservationStatus,
) => {
  try {
    switch (status) {
      case EReservationStatus.ACCEPTED:
        return 'Votre réservation a été acceptée. Nous vous contacterons sous peu. Pour procéder au paiement.';
      case EReservationStatus.CANCELLED:
        return 'Votre réservation a été annulée.';
      case EReservationStatus.ENDED:
        return 'Votre réservation est terminée. Nous espérons que vous avez passé un bon séjour.';
      case EReservationStatus.IN_PROGRESS:
        return 'Votre réservation vient de démarée. Bon séjour!';
      default:
        return 'Réservation mise à jour';
    }
  } catch (error) {
    console.log({ error });
    return 'Réservation mise à jour';
  }
};

export interface ISendPushNotifications {
  companyId: Types.ObjectId;
  houseId: Types.ObjectId;
  authorAction: string;
  client: {
    firstName: string;
    lastName: string;
    phone: string;
  },
  notificationType: string;
  message: string;
}
