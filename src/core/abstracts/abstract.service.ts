import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IGenericDataServices } from '../generics/generic-data.services';
import { User } from '../entities/users/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { Model } from 'mongoose';

@Injectable()
export class MongoDataServices
  implements IGenericDataServices, OnApplicationBootstrap
{
  users: UserRepository<User>;
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<User>,
  ) {}
  onApplicationBootstrap() {
    this.users = new UserRepository<User>(this.userRepository);
  }
}
