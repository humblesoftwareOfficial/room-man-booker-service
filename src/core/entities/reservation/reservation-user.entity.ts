/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserReservationDocument = UserReservation & Document;

@Schema({ _id: false })
export class UserReservation {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, default: "" })
  identification: string;

  @Prop({ type: String, default: null })
  tokenValue: string;
}
