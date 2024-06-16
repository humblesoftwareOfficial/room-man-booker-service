/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DefaultAttributes } from '../shared/default-attributes.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/companies.entity';
import { Place } from '../places/places.entity';

export type HouseDocument = House & Document;

@Schema()
export class House extends DefaultAttributes {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, default: '' })
  description?: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
  places?: Place[] | Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  users?: User[] | Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  company: Company | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastUpdatedBy?: User | Types.ObjectId;
}

export const HouseSchema = SchemaFactory.createForClass(House);
