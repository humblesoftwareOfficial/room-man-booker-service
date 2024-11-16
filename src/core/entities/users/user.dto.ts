import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import {
  EAccountType,
  EAccountTypeCreation,
  EUserGender,
  UserCodeValidator,
} from 'src/features/users/users.helper';
import { PaginationDto } from '../shared/pagination.dto';
import { CompanyCodeValidator } from 'src/features/companies/companies.helper';

export class NewUserDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User gender cannot be empty.' })
  @IsEnum(EUserGender, {
    message: 'User gender is required!',
  })
  gender: EUserGender;

  @IsOptional()
  @IsNotEmpty({ message: 'Account type cannot be empty.' })
  @IsEnum(EAccountTypeCreation, {
    message: 'User account type is required!',
  })
  accountType: EAccountTypeCreation;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid User email.' })
  email: string;

  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'User password is required.' })
  @IsString()
  password: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User pseudo is required.' })
  @IsString()
  pseudo: string;

  @IsOptional()
  @IsString()
  address: string;

  //   @IsOptional()
  //   @IsString()
  //   @Validate(URLValidator)
  //   profile_picture: string;

  @IsOptional()
  @IsArray({
    message: 'Tokens value must an array of valid token value',
  })
  push_tokens: string[];
}

export class UpdatePushTokenDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  user: string;

  @IsNotEmpty({ message: 'Token Value is required' })
  tokenValue: string;
}

export class UserPhoneDto {
  @IsNotEmpty({ message: 'User phone is required.' })
  @IsString()
  phone: string;
}

export class UserCodeDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  user: string;
}

export class UpdateUserDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User gender cannot be empty.' })
  @IsEnum(EUserGender, {
    message: 'User gender is required!',
  })
  gender: EUserGender;

  @IsOptional()
  @IsNotEmpty({ message: 'Account type cannot be empty.' })
  @IsEnum(EAccountType, {
    message: 'User account type is required!',
  })
  accountType: EAccountType;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid User email.' })
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User password is required.' })
  @IsString()
  password: string;

  @IsOptional()
  @IsNotEmpty({ message: 'User password is required.' })
  @IsString()
  pseudo: string;

  @IsOptional()
  @IsString()
  address: string;

  //   @IsOptional()
  //   @IsString()
  //   @Validate(URLValidator)
  //   profile_picture: string;

  @IsOptional()
  @IsArray({
    message: 'Tokens value must an array of valid token value',
  })
  push_tokens: string[];
}

export class FollowAccountDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  user: string;

  @IsNotEmpty({ message: 'Account to follow is required.' })
  @Validate(UserCodeValidator)
  account: string;
}

export class UnFollowAccountDto extends FollowAccountDto {}

export class AuthDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: "User's email cannot be empty. " })
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: "User's card cannot be empty." })
  phone?: string;

  @IsNotEmpty({ message: "User's password is required. " })
  password: string;
}

export class TokenVerificationDto {
  @IsNotEmpty({ message: 'Value cannot be empty ' })
  token: string;
}

export class UsersListingDto extends PaginationDto {
  @IsNotEmpty({ message: "Company is required "})
  @Validate(CompanyCodeValidator)
  company: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true})
  roles: string[];
}

export class RemoveUserDto {
  @IsNotEmpty({ message: 'User who makes action is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  user: string;
}

export class UserRegistrationDto {
  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'User password is required.' })
  @IsString()
  password: string;

  @IsOptional()
  @IsArray({
    message: 'Tokens value must an array of valid token value',
  })
  push_tokens: string[];
}

export class GetUserByPhoneNumberDto {
  @IsNotEmpty({ message: 'Phone number is required'})
  @IsString()
  phoneNumber: string;

  @IsNotEmpty({ message: 'Country code is required'})
  @IsString()
  countryCode: string;
}