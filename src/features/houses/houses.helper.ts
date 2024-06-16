import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

export const isValidHouseCode = (code: string) =>
  code && code.length === 23 && code.includes('HSE-');

@ValidatorConstraint({ name: 'HouseCodeValidator', async: false })
export class HouseCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidHouseCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid  House code.';
  }
}


@ValidatorConstraint({ name: 'ArrayHousesCodesValidator', async: false })
export class ArrayHousesCodesValidator
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(values: string[], _args: ValidationArguments) {
    return Array.isArray(values) && values.every((i) => isValidHouseCode(i));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Houses code array must contain only valid house code.';
  }
}

export interface IHouseList {
  skip: number;
  limit: number;
  companies?: Types.ObjectId[];
}