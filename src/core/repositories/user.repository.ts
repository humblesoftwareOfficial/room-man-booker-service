import { Types } from 'mongoose';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IUserRepository } from '../generics';
import { IUsersList } from 'src/features/users/users.helper';

export class UserRepository<T>
  extends MongoGenericRepository<T>
  implements IUserRepository<T>
{
  
  list({ companiesId, skip, limit, roles }: IUsersList): Promise<any[]> {
    return this._repository
      .aggregate([
        {
          $match: {
            isDeleted: false,
            company: { 
              $in: companiesId,
            },
            ...(roles?.length && {
              account_type: { $in: roles }
            })
          },
        },
        {
          $project: {
            _id: 0,
            password: 0,
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
            users: '$data',
          },
        },
      ])
      .exec();
  }

  findUsersByCompany(
    company: Types.ObjectId,
    filterAttributes: string,
  ): Promise<any[]> {
    return this._repository.find({ company }, filterAttributes).lean().exec();
  }

  authentication(phone: string): Promise<any> {
    return this._repository
      .findOne({ phone }, '-__v -lastUpdatedBy', { lean: true })
      .populate([{
        path: 'company',
        select: '-_id name description code'
      }, {
        path: 'house',
        select: '-_id name code description'
      }])
      .exec();
  }
  
  updatePushTokens(code: string, token: string): Promise<T> {
    return this._repository
      .findOneAndUpdate(
        { code },
        {
          $addToSet: {
            push_tokens: token,
          },
        },
        { new: true },
      )
      .exec();
  }

  removePushTokens(code: string, token: string): Promise<T> {
    return this._repository
      .findOneAndUpdate(
        { code },
        {
          $pull: {
            push_tokens: token,
          },
        },
        { new: true },
      )
      .exec();
  }
}
