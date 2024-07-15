import {
  EReservationStatus,
  IPlaceCAAmount,
  IReservationList,
  IReservationRecap,
  IReservationsByPlace,
} from 'src/features/reservations/reservations.helper';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IReservationRepository } from '../generics';
import { formatDatesInterval } from 'src/features/helpers/date.helper';
import { Types } from 'mongoose';

const PopulateOptions = [
  {
    path: 'place',
    select: '-_id -__v -createdBy -lastUpdatedBy -reservations',
    populate: [
      {
        path: 'house',
        select: '-_id code name description position address',
      },
      {
        path: 'company',
        select: '-_id code name description',
      },
    ],
  },
  {
    path: 'company',
    select: '-_id code name description',
  },
];

export class ReservationRepository<T>
  extends MongoGenericRepository<T>
  implements IReservationRepository<T>
{
  getRecap({
    places,
    endDate,
    startDate,
    status,
  }: IReservationRecap): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            place: { $in: places },
            ...(status?.length && {
              status: { $in: status },
            }),
            ...(startDate &&
              endDate && {
                startDate: { $gte: startDate, $lte: endDate },
              }),
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $count: {},
            },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1
          }
        }
      ])
      .exec();
  }
  getPlaceTotalAmount({
    places,
    startDate,
    endDate,
  }: IPlaceCAAmount): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            place: { $in: places },
            status: {
              $in: [EReservationStatus.IN_PROGRESS, EReservationStatus.ENDED],
            },
            isDeleted: false,
            ...(startDate &&
              endDate && {
                startDate: { $gte: startDate, $lte: endDate },
              }),

            ///revoir le calcul ici.. pour les reservations à longue durée
          },
        },
        {
          $group: {
            _id: '$place',
            amount: {
              $sum: '$price.value',
            },
          },
        },
        {
          $lookup: {
            from: 'places',
            localField: '_id',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  name: '$name',
                  code: '$code',
                  description: '$description',
                },
              },
            ],
            as: 'place',
          },
        },
        {
          $unwind: {
            path: '$place',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .exec();
  }

  list({
    limit,
    skip,
    status,
    companiesId,
    placesId,
    housesId
  }: IReservationList): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            ...(status?.length && {
              status: { $in: status },
            }),
            ...(companiesId?.length && {
              company: { $in: companiesId },
            }),
            ...(housesId?.length && {
              house: { $in: housesId },
            }),
            ...(placesId?.length && {
              place: { $in: placesId },
            }),
          },
        },
        {
          $project: {
            _id: 0,
            lastUpdatedBy: 0,
            createdBy: 0,
            __v: 0,
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
            reservations: '$data',
          },
        },
      ])
      .exec();
  }

  populateReservationInfos(value: any): Promise<any> {
    return this._repository.populate(value, PopulateOptions);
  }

  getReservationsByPlace({
    status,
    placeId,
    startDate,
    endDate,
  }: IReservationsByPlace): Promise<any[]> {
    const { formatedEndDate, formatedOneDateFilter } = formatDatesInterval(
      startDate,
      endDate,
    );
    let resultEndDate = null;
    if (endDate && !startDate) {
      resultEndDate = formatDatesInterval(endDate, null);
    }
    return this._repository
      .aggregate([
        {
          $match: {
            place: placeId,
            ...(status?.length && {
              status: { $in: status },
            }),
            ...(startDate &&
              endDate && {
                startDate: { $gte: startDate, $lte: formatedEndDate },
              }),
            ...(startDate &&
              !endDate && {
                startDate: {
                  $gte: formatedOneDateFilter.startDate,
                  $lte: formatedOneDateFilter.endDate,
                },
              }),
            ...(!startDate &&
              endDate && {
                endDate: {
                  $gte: resultEndDate.formatedOneDateFilter.startDate,
                  $lte: resultEndDate.formatedOneDateFilter.endDate,
                },
              }),
          },
        },
        {
          $project: {
            _id: 0,
            place: 0,
            __v: 0,
            lastUpdatedBy: 0,
            enterprise: 0,
          },
        },
      ])
      .exec();
  }
}
