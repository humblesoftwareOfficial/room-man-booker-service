import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/jwt.auth.guard';
import { FavoritesService } from './favorites.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddToFavoriteDto,
  GetUserFavoritePlacesListDto,
} from 'src/core/entities/favorites/favorites.dto';
import { Favorite } from 'src/core/entities/favorites/favorites.entity';

@ApiTags('Favorites')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private service: FavoritesService) {}

  @ApiCreatedResponse({
    description: 'Favorite added.',
    type: Favorite,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/add')
  async addToFavorite(@Body() value: AddToFavoriteDto) {
    return this.service.addToFavorite(value);
  }

  @ApiOkResponse({
    description: 'Favorite removed.',
    type: Favorite,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/remove')
  async removeFromFavorite(@Body() value: AddToFavoriteDto) {
    return this.service.removeFromFavorite(value);
  }

  @ApiOkResponse({
    description: 'Favorites list.',
    type: Favorite,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/list')
  async list(@Body() value: GetUserFavoritePlacesListDto) {
    return this.service.list(value);
  }
}
