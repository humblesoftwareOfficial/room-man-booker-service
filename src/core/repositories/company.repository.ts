import { Types } from 'mongoose';
import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { ICompanyRepository } from '../generics';

export class CompanyRepository<T>
  extends MongoGenericRepository<T>
  implements ICompanyRepository<T>
{
  linkHousesToCompany(
    houses: Types.ObjectId[],
    idCompany: Types.ObjectId,
  ): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idCompany, {
        $addToSet: {
          houses,
        },
      })
      .exec();
  }
  unlinkHousesToCompany(
    houses: Types.ObjectId[],
    idCompany: Types.ObjectId,
  ): Promise<T> {
    return this._repository
      .findByIdAndUpdate(idCompany, {
        $pull: {
          houses,
        },
      })
      .exec();
  }
}
