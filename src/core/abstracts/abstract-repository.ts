/* eslint-disable prettier/prettier */
import { ClientSession, FilterQuery, FlattenMaps, Model, Require_id, Types } from 'mongoose';
import { IGenericRepository } from '../generics';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
  public readonly _repository: Model<T>;
  public readonly _populateOnFind: string[];

  constructor(repository: Model<T>, populateOnFind: string[] = []) {
    this._repository = repository;
    this._populateOnFind = populateOnFind;
  }

  findAll(filterAttributes: string): Promise<any[]> {
    return this._repository.find({}, filterAttributes, { lean: true }).populate(this._populateOnFind).exec();
  }

  findOne(code: string, filterAttributes: string): Promise<any> {
    const query: FilterQuery<any> = { code };
    return this._repository.findOne(query, filterAttributes, { lean: true }).exec();
  }

  findById(_id: Types.ObjectId, filterAttributes: string): Promise<any> {
    return this._repository.findById(_id, filterAttributes, { lean: true }).exec();
  }

  create(item: T): Promise<T> {
    return this._repository.create(item);
  }

  createInTransaction(item: T[], session: ClientSession): Promise<any> {
    return this._repository.create(item, {
      session,
    });
  }

  update(code: string, update: any): Promise<any> {
    const query: FilterQuery<any> = { code };
    return this._repository.findOneAndUpdate(query, update, { new: true }).exec();
  }

  updateById(_id: Types.ObjectId, update: any): Promise<any> {
    const query: FilterQuery<any> = { _id };
    return this._repository.findOneAndUpdate(query, update, { new: true }).exec();
  }

  updateInTransaction(code: string, update: any, session: ClientSession): Promise<any> {
    const query: FilterQuery<any> = { code };
    return this._repository.findOneAndUpdate(query, update, { new: true, session }).exec();
  }

  updateWithFilterObject(filter: any, update: any): Promise<any> {
    return this._repository.updateMany({ ...filter }, update, { new: true }).exec();
  }

  updateWithFilterObjectInTransaction(filter: any, update: any, session: ClientSession): Promise<T> {
    return this._repository.findOneAndUpdate({ ...filter }, update, { new: true, session }).exec();
  }

  async findAllByCodes(codes: string[], filterAttributes: string): Promise<any[]> {
    return this._repository.find({ code: { $in: codes } }, filterAttributes, { lean: true }).exec();
  }

  // async findManyByPoles(poleIds: string[], filterAttributes: string): Promise<Require_id<FlattenMaps<T>>[]> {
  //   return this._repository.find({ 'pole.entity': { $in: poleIds } }, filterAttributes, { lean: true }).exec();
  // }

  bulkWrite(operations: any[]): Promise<any> {
    return this._repository.bulkWrite(operations);
  }

  bulkWriteInTransaction(operations: any[], session: ClientSession): Promise<any> {
    return this._repository.bulkWrite(operations, { session });
  }

  count(filter: any): Promise<number> {
    return this._repository
      .find({ ...filter })
      .countDocuments()
      .exec();
  }

  updateManyInTransaction(filter: any, update: any, session: ClientSession): Promise<any> {
    return this._repository.updateMany({ ...filter }, update, { new: true, session }).exec();
  }

  populateEntities(value: any, populateOptions: any[]): Promise<any> {
    return this._repository.populate(value, populateOptions);
  }

  // getLastInsertedDocument(): Promise<T[]> {
  //   return this._repository.find({}).sort({ _id: -1 }).limit(1).exec();
  // }

  // findAllByIds(ids: Types.ObjectId[], filterAttributes: string): Promise<any[]> {
  //   return this._repository.find({ _id: { $in: ids } }, filterAttributes, { lean: true }).exec();
  // }
}
