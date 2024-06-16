import { Types } from 'mongoose';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IUserRepository } from '../generics';

export class UserRepository<T>
  extends MongoGenericRepository<T>
  implements IUserRepository<T>
{
  findUsersByCompany(
    company: Types.ObjectId,
    filterAttributes: string,
  ): Promise<any[]> {
    return this._repository.find({ company }, filterAttributes).lean().exec();
  }
  authentication(phone: string): Promise<any> {
    return this._repository
      .findOne({ phone }, '-__v -lastUpdatedBy', { lean: true })
      .populate({
        path: 'company',
        select: '-_id name description code'
      })
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
}
