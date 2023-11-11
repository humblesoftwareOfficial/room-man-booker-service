import { MongoGenericRepository } from '../abstracts/abstract-repository';
import { IUserRepository } from '../generics';

export class UserRepository<T>
  extends MongoGenericRepository<T>
  implements IUserRepository<T> {}
