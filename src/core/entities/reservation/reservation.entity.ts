/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';;

import { DefaultAttributes } from '../shared/default-attributes.entity';
import { PlacePrice } from '../places/place-price.entity';
import { EReservationDuration, EReservationStatus } from 'src/features/reservations/reservations.helper';
import { UserReservation } from './reservation-user.entity';
import { Place } from '../places/places.entity';
import { Company } from '../companies/companies.entity';
import { User } from '../users/user.entity';
import { House } from '../houses/houses.entity';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation extends DefaultAttributes {
  @Prop({ type: Date, default: null })
  startDate?: Date;

  @Prop({ type: Date, default: null })
  endDate?: Date;

  @Prop({ type: Date, default: null })
  realStartDate?: Date;

  @Prop({ type: Date, default: null })
  realEndDate?: Date;

  @Prop({ type: {} })
  price?: PlacePrice;

  @Prop({
    type: String,
    enum: EReservationStatus,
    default: EReservationStatus.ON_REQUEST,
  })
  status?: EReservationStatus;

  @Prop({ type: String, enum: EReservationDuration })
  duration?: EReservationDuration;

  @Prop({ required: true })
  user: UserReservation;

  @Prop({ required: true, ref: 'Place', type: Types.ObjectId })
  place: Place | Types.ObjectId;

  @Prop({ ref: 'Company', type: Types.ObjectId })
  company: Company | Types.ObjectId;

  @Prop({ ref: 'House', type: Types.ObjectId })
  house: House | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastUpdatedBy?: User | Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isExtended?: boolean;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
