import { IFavoritePlacesList } from 'src/features/favorites/favorites.helper';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IFavoriteRepository } from '../generics';

export class FavoriteRepository<T>
  extends MongoGenericRepository<T>
  implements IFavoriteRepository<T>
{
  getUserFavorites({ user, skip, limit }: IFavoritePlacesList): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            user: {
              $in: [user],
            },
          },
        },
        {
          $project: {
            _id: 0,
            place: { $reverseArray: '$places' },
          },
        },
        {
          $unwind: {
            path: '$place',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            count: [
              {
                $group: {
                  _id: null,
                  value: {
                    $sum: 1,
                  },
                  totalAmount: {
                    $sum: '$value',
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                },
              },
            ],
            data: [
              {
                $project: {
                  _id: 0,
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$count',
          },
        },
        {
          $unwind: {
            path: '$data',
          },
        },
        {
          $project: {
            total: '$count.value',
            places: '$data',
          },
        },
        {
          $lookup: {
            from: 'places',
            localField: 'places.place',
            foreignField: '_id',
            as: 'places.place',
          },
        },
        {
          $unwind: {
            path: '$places.place',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            total: 1,
            code: '$places.place.code',
            createdAt: '$places.place.createdAt',
            label: '$places.place.label',
            description: '$places.place.description',
            prices: '$places.place.prices',
            properties: '$places.place.properties',
            position: '$places.place.position',
            house: '$places.place.house',
            company: '$places.place.company',
            type: '$places.place.type',
            // enterprise: '$places.place.enterprise',
            star: '$places.place.star',
            medias: '$places.place.medias',
            isAvailable: '$places.place.isAvailable',
            isOnTop: '$places.place.isOnTop',
          },
        },
      ])
      .exec();
  }
}
