import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
    IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ArrayCompanyCodesValidator, CompanyCodeValidator } from 'src/features/companies/companies.helper';
import { HouseCodeValidator } from 'src/features/houses/houses.helper';
import {
  EUserGender,
  UserCodeValidator,
} from 'src/features/users/users.helper';
import { PaginationDto } from '../shared/pagination.dto';

export class HouseUserDto {
  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'User gender cannot be empty.' })
  @IsEnum(EUserGender, {
    message: 'User gender is required!',
  })
  gender: EUserGender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid User email.' })
  email: string;

  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'User password is required.' })
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'User pseudo is required.' })
  @IsString()
  pseudo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address: string;
}

export class NewHouseDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Company is required.' })
  @Validate(CompanyCodeValidator)
  company: string;

  @IsNotEmpty({ message: 'House name is required.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'House address is required.' })
  @IsString()
  address: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;
}

export class AddUserToHouseDto {
  @IsNotEmptyObject({ nullable: false }, { message: 'User cannot be empty' })
  @ValidateNested()
  @Type(() => HouseUserDto)
  user: HouseUserDto;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'House is required.' })
  @Validate(HouseCodeValidator)
  house: string;
}

export class HousesListDto extends PaginationDto {
  @IsArray()
  @Validate(ArrayCompanyCodesValidator)
  companies: string[];
}