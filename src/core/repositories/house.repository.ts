import { Types } from 'mongoose';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IHouseRepository } from '../generics';
import { IHouseList } from 'src/features/houses/houses.helper';

export class HouseRepository<T>
  extends MongoGenericRepository<T>
  implements IHouseRepository<T>
{
  list({ skip, limit, companies }: IHouseList): Promise<any[]> {
    return this._repository.aggregate([
      {
        $match: {
          isDeleted: false,
          ...(companies?.length && {
            company: { $in: companies },
          }),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 0,
                code: '$code',
                firstName: '$firstName',
                lastName: '$lastName',
                phone: '$phone',
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $project: {
          _id: 0,
          code: 1,
          name: 1,
          description: 1,
          address: 1,
          users: 1
        },
      },
    ]);
  }
  linkPlacesToHouse(
    places: Types.ObjectId[],
    idHouse: Types.ObjectId,
  ): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idHouse, {
        $addToSet: {
          places,
        },
      })
      .exec();
  }
  unlinkPlacesToHouse(
    places: Types.ObjectId[],
    idHouse: Types.ObjectId,
  ): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idHouse, {
        $pull: {
          places,
        },
      })
      .exec();
  }
}
