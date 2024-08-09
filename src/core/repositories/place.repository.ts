import { Types } from 'mongoose';
import { IPlaceList } from 'src/features/places/places.helper';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { Medias } from '../entities/places/place-media.entity';
import { IPlaceRepository } from '../generics';
import { hasValue } from 'src/config/code-generator';

const PopulateOptions = [
  {
    path: 'company',
    select: '-_id code name description',
  },
  {
    path: 'house',
    select: '-_id code name address description',
  },
  {
    path: 'reservation',
    select: '-_id -__v -place',
  },
];

export class PlaceRepository<T>
  extends MongoGenericRepository<T>
  implements IPlaceRepository<T>
{
  getPlacesByCompany(company: Types.ObjectId): Promise<any[]> {
    return this._repository.aggregate([
      {
        $match: {
          company,
          isDeleted: false,
        }
      },
      {
        $project: {
          reservations: 0,
          __v: 0
        }
      }
    ]).exec();
  }

  list({
    skip,
    limit,
    searchTerm,
    types,
    properties,
    minPrice,
    maxPrice,
    isAvailable,
    isOnTop,
    companies,
    houses,
    status
  }: IPlaceList): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            ...(types?.length && {
              type: {
                $in: types,
              },
            }),
            ...(searchTerm && {
              $or: [
                {
                  description: {
                    $regex: new RegExp(searchTerm, 'i'),
                  },
                },
                {
                  'position.description': {
                    $regex: new RegExp(searchTerm, 'i'),
                  },
                },
              ],
            }),
            // ...(properties?.length && {
            //   properties: {
            //     $elemMatch: {
            //       $in: properties,
            //     },
            //   },
            // }),
            ...(properties?.length && {
              properties: {
                $all: properties,
              },
            }),
            ...(hasValue(maxPrice) &&
              hasValue(minPrice) && {
                prices: {
                  $elemMatch: {
                    value: {
                      $gte: minPrice,
                      $lte: maxPrice,
                    },
                  },
                },
              }),
            ...(hasValue(isAvailable) && {
              isAvailable: isAvailable,
            }),
            ...(companies?.length && {
              company: { $in: companies },
            }),
            ...(houses?.length && {
              house: { $in: houses },
            }),
            ...(hasValue(isOnTop) && {
              isOnTop: isOnTop,
            }),
            ...(status?.length && {
              currentStatus: {
                $in: status,
              },
            }),
          },
        },
        {
          $project: {
            _id: 0,
            lastUpdatedBy: 0,
            createdBy: 0,
            __v: 0,
            reservations: 0,
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
      ])
      .exec();
  }

  linkMediasToPlace(medias: Medias[], idPlace: Types.ObjectId): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idPlace, {
        $addToSet: {
          medias,
        },
      })
      .exec();
  }

  unLinkMediasToPlace(medias: Medias[], idPlace: Types.ObjectId): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idPlace, {
        $pull: {
          medias,
        },
      })
      .exec();
  }

  populatePlaceInfos(value: any): Promise<any> {
    return this._repository.populate(value, PopulateOptions);
  }
}
