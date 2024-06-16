/* eslint-disable prettier/prettier */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NotEmptyArrayValidator', async: false })
export class NotEmptyArrayValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, _args: ValidationArguments) {
    return Array.isArray(value) && value?.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return `Array cannot be empty.`;
  }
}

export const findObjectsInArray1AndNotInArray2 = (
  array_1: any[],
  array_2: any[],
  attributeFilter: string,
) => {
  const result = array_1.filter(
    (o1) => !array_2.some((o2) => o1[attributeFilter] === o2[attributeFilter]),
  );
  return result;
};
