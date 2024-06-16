/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EDevise } from 'src/features/places/places.helper';

export type PlacePriceDocument = PlacePrice & Document;

@Schema({ _id: false })
export class PlacePrice {
  @Prop({ required: true, type: Number })
  value: number;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, enum: EDevise, default: EDevise.FCFA })
  devise: EDevise;
}
