/* eslint-disable prettier/prettier */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
export const isValidCompanyCode = (code: string) =>
  code && code.length === 23 && code.includes('COM-');

@ValidatorConstraint({ name: 'CompanyCodeValidator', async: false })
export class CompanyCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidCompanyCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid Company code.';
  }
}

@ValidatorConstraint({ name: 'ArrayCompanyCodesValidator', async: false })
export class ArrayCompanyCodesValidator
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(values: string[], _args: ValidationArguments) {
    return Array.isArray(values) && values.every((i) => isValidCompanyCode(i));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Companies code array must contain only valid Company code.';
  }
}
