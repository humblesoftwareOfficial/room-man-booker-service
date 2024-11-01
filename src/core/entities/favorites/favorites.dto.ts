/* eslint-disable prettier/prettier */

import { IsNotEmpty, Validate } from 'class-validator';
import { PlaceCodeValidator } from 'src/features/places/places.helper';
import { UserCodeValidator } from 'src/features/users/users.helper';
import { PaginationDto } from '../shared/pagination.dto';

export class AddToFavoriteDto {
  @IsNotEmpty({ message: 'User code is required.' })
  @Validate(UserCodeValidator)
  user: string;

  @IsNotEmpty({ message: 'Place code is required.' })
  @Validate(PlaceCodeValidator)
  place: string;
}

export class RemoveFromFavoriteDto {
  @IsNotEmpty({ message: 'User code is required.' })
  @Validate(UserCodeValidator)
  user: string;

  @IsNotEmpty({ message: 'Place code is required.' })
  @Validate(PlaceCodeValidator)
  place: string;
}

export class GetUserFavoritePlacesListDto extends PaginationDto {
  @IsNotEmpty({ message: 'User code is required.' })
  @Validate(UserCodeValidator)
  user: string;
}
