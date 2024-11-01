/* eslint-disable prettier/prettier */

import { Types } from 'mongoose';

export interface IFavoritePlacesList {
  skip: number;
  limit: number;
  user: Types.ObjectId;
}
