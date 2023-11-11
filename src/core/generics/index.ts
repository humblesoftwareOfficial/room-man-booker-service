export abstract class IGenericRepository<T> {
  abstract findAll(filterAttributes: string): Promise<T[]>;

  abstract findOne(code: string, filterAttributes: string): Promise<T>;

  abstract create(item: T): Promise<T>;

  abstract update(code: string, update: any): Promise<T>;

  abstract updateWithFilterObject(filter: any, update: any): Promise<T>;

  abstract findAllByCodes(
    codes: string[],
    filterAttributes: string,
  ): Promise<T[]>;
}

export abstract class IUserRepository<T> {
  
}
