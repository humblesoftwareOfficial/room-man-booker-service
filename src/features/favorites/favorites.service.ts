import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { fail, Result, succeed } from "src/config/http-response";
import { AddToFavoriteDto, GetUserFavoritePlacesListDto, RemoveFromFavoriteDto } from "src/core/entities/favorites/favorites.dto";
import { IGenericDataServices } from "src/core/generics/generic-data.services";

@Injectable()
export class FavoritesService {
  constructor(
    private dataServices: IGenericDataServices,
  ) {}

  async addToFavorite(value: AddToFavoriteDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(value.user, '_id');
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'User not found!',
        });
      }
      const place = await this.dataServices.places.findOne(value.place, '_id');
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'Place not found!',
        });
      }
      const filter = {
        user: user['_id'],
      };
      const update = {
        lastUpdatedAt: new Date(),
        $addToSet: {
          places: place['_id'],
        },
      };
      await this.dataServices.favorites.updateWithCustomFilter(filter, update);
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        'Error while adding place to favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFromFavorite(value: RemoveFromFavoriteDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(value.user, '_id');
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'User not found!',
        });
      }
      const place = await this.dataServices.places.findOne(value.place, '_id');
      if (!place) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'Place not found!',
        });
      }
      const filter = {
        user: user['_id'],
      };
      const update = {
        lastUpdatedAt: new Date(),
        $pull: {
          places: place['_id'],
        },
      };
      await this.dataServices.favorites.updateWithCustomFilter(filter, update);
      return succeed({
        code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        'Error while adding place to favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(filter: GetUserFavoritePlacesListDto): Promise<Result> {
    try {
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      const user = await this.dataServices.users.findOne(filter.user, '_id');
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'User not found!',
        });
      }
      const result = await this.dataServices.favorites.getUserFavorites({
        limit,
        skip,
        user: user['_id'],
      });
      if (!result.length || !result[0].code) {
        return succeed({
          code: HttpStatus.BAD_REQUEST,
          message: '',
          data: { total: 0, places: [] },
        });
      }
      const total = result[0].total;
      const places = result.flatMap((i) => ({
        ...i,
        total: undefined,
      }));
      await this.dataServices.places.populatePlaceInfos(places);
      return succeed({
        code: HttpStatus.OK,
        data: {
          total,
          places,
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting places. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}