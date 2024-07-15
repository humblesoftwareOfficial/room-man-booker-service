/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsValidDate, IsValidFullDate } from 'src/features/helpers/date.helper';
import { ArrayPlaceCodesValidator, PlaceCodeValidator } from 'src/features/places/places.helper';
import { ArrayReservationStatusValidator, EReservationDuration, EReservationStatus, ReservationCodeValidator } from 'src/features/reservations/reservations.helper';
import { PlacePricePriceDto } from '../places/places.dto';
import { UserCodeValidator } from 'src/features/users/users.helper';
import { PaginationDto } from '../shared/pagination.dto';
import { ArrayHousesCodesValidator, HouseCodeValidator } from 'src/features/houses/houses.helper';


export class NewReservationDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;
  
  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identification: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tokenValue: string;

  @IsNotEmpty({ message: 'Place is required.' })
  @Validate(PlaceCodeValidator)
  place: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EReservationDuration, {
    message: 'reservation duration must be a valid EReservationDuration value',
  })
  duration: EReservationDuration;
}

export class UpdateReservationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EReservationStatus, {
    message: 'Reservation status must be a valid EReservationStatus value',
  })
  status: EReservationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EReservationDuration, {
    message: 'reservation duration must be a valid EReservationDuration value',
  })
  duration: EReservationDuration;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'User first name is required.' })
  @IsString()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'User last name is required.' })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  realStartDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidFullDate)
  realEndDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'Price value cannot be empty' },
  )
  @ValidateNested()
  @Type(() => PlacePricePriceDto)
  price: PlacePricePriceDto;

  @IsNotEmpty({ message: 'Reservation is required.' })
  @Validate(ReservationCodeValidator)
  reservation: string;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;
}
export class ReservationListDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayReservationStatusValidator)
  status: EReservationStatus[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm: string;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlaceCodesValidator)
  places: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @Validate(HouseCodeValidator)
  house: string;
}

export class ReservationRequestDto extends NewReservationDto {}

export class AcceptReservationRequestDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Reservation is required.' })
  @Validate(ReservationCodeValidator)
  reservation: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  start: boolean;
}

export class DeclineReservationRequestDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Reservation is required.' })
  @Validate(ReservationCodeValidator)
  reservation: string;
}

export class ExtendReservationDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Reservation is required.' })
  @Validate(ReservationCodeValidator)
  reservation: string;

  @Validate(IsValidFullDate)
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price: number;
}