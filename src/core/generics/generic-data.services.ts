import { User } from '../entities/users/user.entity';
import { UserRepository } from '../repositories/user.repository';

export abstract class IGenericDataServices {
  abstract users: UserRepository<User>;
}
