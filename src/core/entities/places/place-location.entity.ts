/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlaceLocationDocument = PlaceLocation & Document;

@Schema({ _id: false })
export class PlaceLocation {
  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: Number, default: null })
  latitude?: number;

  @Prop({ type: Number, default: null })
  longitude?: number;

  @Prop({ type: {}, default: null })
  extras?: any;
}
