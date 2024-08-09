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
  IsUrl,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ArrayCompanyCodesValidator, CompanyCodeValidator } from 'src/features/companies/companies.helper';
import { NotEmptyArrayValidator } from 'src/features/helpers/array.helper';
import { IsValidDate } from 'src/features/helpers/date.helper';
import { URLValidator } from 'src/features/helpers/url.helper';
import { ArrayPlacePropertiesValidator, ArrayPlaceStatusValidator, ArrayPlaceTypesValidator, EDevise, EPlaceProperty, EPlaceStatus, EPlaceType, PlaceCodeValidator } from 'src/features/places/places.helper';
import { UserCodeValidator } from 'src/features/users/users.helper';
import { PaginationDto } from '../shared/pagination.dto';
import { ArrayHousesCodesValidator, HouseCodeValidator } from 'src/features/houses/houses.helper';


export class PlacePricePriceDto {
  @Type(() => Number)
  @IsInt()
  value: number;

  @IsNotEmpty({ message: 'Description of price is required' })
  @IsString()
  description: string;

  @IsEnum(EDevise, {
    message: "Price's devise must be a valid EDevise value",
  })
  devise: EDevise;
}

export class PositionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'Adress of place is required.' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  extras: any;
}

export class PlaceMediaDto {
  @IsNotEmpty({ message: 'URL of media is required.' })
  @Validate(URLValidator)
  url: string;
}

export class NewPlaceDto {
  @IsNotEmpty({ message: 'House is required.' })
  @Validate(HouseCodeValidator)
  house: string;

  @IsNotEmpty({ message: 'Description is required.' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlacePropertiesValidator)
  properties: EPlaceProperty[];

  @IsArray({
    message: 'Prices must be a valid array of PlacePricePriceDto.',
  })
  @Validate(NotEmptyArrayValidator)
  @ValidateNested({ each: true })
  @Type(() => PlacePricePriceDto)
  prices: PlacePricePriceDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  star: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'Poistion value cannot be empty' },
  )
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsNotEmpty({ message: 'Place type is required.' })
  @IsEnum(EPlaceType, {
    message: 'Place type must be a valid EPlaceType value',
  })
  type: EPlaceType;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsArray({
    message: 'Medias must be a valid array of PlaceMediaDto.',
  })
  @Validate(NotEmptyArrayValidator)
  @ValidateNested({ each: true })
  @Type(() => PlaceMediaDto)
  medias: PlaceMediaDto[];
}

export class UpdatePlaceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'Description is required.' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlacePropertiesValidator)
  properties: EPlaceProperty[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray({
    message: 'Prices must be a valid array of PlacePricePriceDto.',
  })
  @Validate(NotEmptyArrayValidator)
  @ValidateNested({ each: true })
  @Type(() => PlacePricePriceDto)
  prices: PlacePricePriceDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  star: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'Poistion value cannot be empty' },
  )
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EPlaceType, {
    message: 'Place type must be a valid EPlaceType value',
  })
  type: EPlaceType;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @IsNotEmpty({ message: 'Place is required.' })
  @Validate(PlaceCodeValidator)
  place: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isOnTop: boolean;

  @IsOptional()
  @IsNotEmpty({ message: 'Current status cannot be empty.' })
  @IsEnum(EPlaceStatus, {
    message: 'Current status is required!',
  })
  currentStatus: EPlaceStatus;
}

export class AddMediasDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Place is required.' })
  @Validate(PlaceCodeValidator)
  place: string;

  @IsArray({
    message: 'Medias must be a valid array of PlaceMediaDto.',
  })
  @Validate(NotEmptyArrayValidator)
  @ValidateNested({ each: true })
  @Type(() => PlaceMediaDto)
  medias: PlaceMediaDto[];
}

export class PlaceListDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlacePropertiesValidator)
  properties: EPlaceProperty[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlaceTypesValidator)
  types: EPlaceType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayCompanyCodesValidator)
  companies: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayHousesCodesValidator)
  houses: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isOnTop: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayPlaceStatusValidator)
  status: EPlaceStatus[];
}

export class GetReservationsByPlaceDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Place is required.' })
  @Validate(PlaceCodeValidator)
  place: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidDate)
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsValidDate)
  endDate: string;
}

export class GetStatsByCompanyDto {
  @IsNotEmpty({ message: 'Company is required.' })
  @Validate(CompanyCodeValidator)
  company: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'Company is required.' })
  @Validate(HouseCodeValidator)
  house: string;
}

export class UpdateMediasDto {
  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @IsNotEmpty({ message: 'Place is required.' })
  @Validate(PlaceCodeValidator)
  place: string;

  @IsArray({
    message: 'Medias must be a valid array of PlaceMediaDto.',
  })
  @Validate(NotEmptyArrayValidator)
  @ValidateNested({ each: true })
  @Type(() => PlaceMediaDto)
  medias: PlaceMediaDto[];
}

export class GetStatsCAByCompany {
  @IsNotEmpty({ message: 'Company is required.' })
  @Validate(CompanyCodeValidator)
  company: string;

  @IsNotEmpty({ message: 'User is required.' })
  @Validate(UserCodeValidator)
  by: string;

  @Validate(IsValidDate)
  startDate: string;

  @Validate(IsValidDate)
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Validate(ArrayHousesCodesValidator)
  houses: string[];
}