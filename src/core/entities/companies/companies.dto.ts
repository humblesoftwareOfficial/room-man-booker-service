import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import {
  EUserGender,
  UserCodeValidator,
} from 'src/features/users/users.helper';

export class CompanyUserDto {
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

export class NewCompanyDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Company name is required.' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmptyObject({ nullable: false }, { message: 'Owner cannot be empty' })
  @ValidateNested()
  @Type(() => CompanyUserDto)
  owner: CompanyUserDto;
}
