/* eslint-disable prettier/prettier */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
export const isValidPlaceCode = (code: string) =>
  code && code.length === 23 && code.includes('PLA-');

export const isValidPropertyEnum = (value: any) => value in EPlaceProperty;

export const isValidPlaceTypeEnum = (value: any) => value in EPlaceType;

@ValidatorConstraint({ name: 'PlaceCodeValidator', async: false })
export class PlaceCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidPlaceCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid place code.';
  }
}

@ValidatorConstraint({ name: 'ArrayPlaceCodesValidator', async: false })
export class ArrayPlaceCodesValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(values: string[], _args: ValidationArguments) {
    return Array.isArray(values) && values.every((i) => isValidPlaceCode(i));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Places code array must contain only valid place code.';
  }
}

@ValidatorConstraint({ name: 'ArrayPlacePropertiesValidator', async: false })
export class ArrayPlacePropertiesValidator
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(roles: string[], _args: ValidationArguments) {
    let isValidArray = true;
    for (const name of roles) {
      if (!isValidPropertyEnum(name)) {
        isValidArray = false;
        break;
      }
    }
    return isValidArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Propoerties array must contain only valid property name.';
  }
}

@ValidatorConstraint({ name: 'ArrayPlaceTypesValidator', async: false })
export class ArrayPlaceTypesValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(roles: string[], _args: ValidationArguments) {
    let isValidArray = true;
    for (const name of roles) {
      if (!isValidPlaceTypeEnum(name)) {
        isValidArray = false;
        break;
      }
    }
    return isValidArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Types array must contain only valid place type.';
  }
}

export enum EPlaceProperty {
  Air_Conditioner = 'Air_Conditioner',
  Toilet = 'Toilet',
  Wifi = 'Wifi',
  Balcony = 'Balcony',
  Parking = 'Parking',
  TV = 'TV',
  Fan = 'Fan',
}

export enum EDevise {
  FCFA = 'FCFA',
  EURO = 'EURO',
  DOLLAR = 'DOLLAR',
}

export enum EPlaceType {
  ROOM = 'ROOM',
  APPARTMENT = 'APPARTMENT',
  SUITE = 'SUITE',
  HOUSE = 'HOUSE',
}

export enum EPlaceStatus {
  AVAILABLE = 'AVAILABLE',
  TAKEN = 'TAKEN',
  OFF = 'OFF',
}
export interface IPlaceList {
  types?: EPlaceType[];
  properties?: EPlaceProperty[];
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  skip: number;
  limit: number;
  companies?: Types.ObjectId[];
  houses?: Types.ObjectId[];
  isOnTop?: boolean;
}
