/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.entity';
import { Place } from '../places/places.entity';

export type FavoriteDocument = Favorite & Document;

@Schema()
export class Favorite {
  @Prop({ required: true, ref: 'User', type: Types.ObjectId, index: true })
  user: User | Types.ObjectId;

  @Prop({ ref: 'Place', type: [Types.ObjectId], default: [] })
  places: Place[] | Types.ObjectId[];

  @Prop({ required: true, type: Date, default: new Date() })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: new Date() })
  lastUpdatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
