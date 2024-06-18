/* eslint-disable prettier/prettier */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
import { User } from 'src/core/entities/users/user.entity';

export const isValidUserCode = (code: string) =>
  code && code.length === 23 && code.includes('USR-');

@ValidatorConstraint({ name: 'UserCodeValidator', async: false })
export class UserCodeValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(code: string, _args: ValidationArguments) {
    return isValidUserCode(code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'Invalid  user code.';
  }
}

@ValidatorConstraint({ name: 'UsersCodesValidator' })
export class UsersCodesValidator implements ValidatorConstraintInterface {
  validate(codes: string[], _args: ValidationArguments) {
    let isValid = true;
    for (const code of codes) {
      if (!isValidUserCode(code)) isValid = false;
    }
    return isValid;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_args: ValidationArguments) {
    return 'At least one active user code you provided is incorrect.';
  }
}

export const getDefaultUserInfos = (user: User) => ({
  code: user?.code,
  firstName: user?.firstName,
  lastName: user?.lastName,
  isDeleted: user?.isDeleted,
  email: user?.email,
  createdAt: user?.createdAt,
  lastUpdatedDate: user?.lastUpdatedAt,
  phone: user?.phone,
//   push_tokens: user.push_tokens,
//   profile_picture: user?.profile_picture,
  accountType: user?.account_type,
});

export interface IFindUserbyEmailOrPhone {
  email: string;
  phone: string;
}

export interface IUserTokenVerification {
  id: string;
  code: string;
}

export enum EAccountType {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum EAccountTypeCreation {
    ADMIN = 'ADMIN',
    SUPERVISOR = 'SUPERVISOR',
  }

export enum EUserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface IUsersList {
  companiesId?: Types.ObjectId[];
  skip: number;
  limit: number;
  roles?: string[]
}