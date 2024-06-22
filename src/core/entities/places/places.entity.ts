/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { DefaultAttributes } from '../shared/default-attributes.entity';
import { PlacePrice } from './place-price.entity';
import { PlaceLocation } from './place-location.entity';
import { EPlaceProperty, EPlaceStatus, EPlaceType } from 'src/features/places/places.helper';
import { Medias } from './place-media.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Company } from '../companies/companies.entity';
import { User } from '../users/user.entity';
import { House } from '../houses/houses.entity';

export type PlaceDocument = Place & Document;

@Schema()
export class Place extends DefaultAttributes {
  @Prop({ type: String, default: '' })
  label: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: [String], enum: [EPlaceProperty], default: [] })
  properties: EPlaceProperty[];

  @Prop({ type: [], default: [] })
  prices: PlacePrice[];

  @Prop({ type: Number, default: 0 })
  star?: number;

  @Prop({ type: Boolean, default: true })
  isAvailable?: boolean;

  @Prop({ type: PlaceLocation, required: false, default: null })
  position?: PlaceLocation;

  @Prop({ type: String, enum: EPlaceType, default: EPlaceType.ROOM })
  type: EPlaceType;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Company',
    index: true,
  })
  company: Company | Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'House',
    index: true,
  })
  house: House | Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Reservation', default: [] })
  reservations?: Reservation[] | Types.ObjectId[];

  @Prop({ type: [], default: [] })
  medias: Medias[];

  @Prop({ type: Boolean, default: false })
  isOnTop?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastUpdatedBy?: User | Types.ObjectId;

  @Prop({ type: String, enum: EPlaceStatus, default: EPlaceStatus.AVAILABLE })
  currentStatus?: EPlaceStatus;

  @Prop({ type: [Types.ObjectId], ref: 'Reservation', default: [] })
  reservationsRequests?: Reservation[] | Types.ObjectId[];
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
