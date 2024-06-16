/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DefaultAttributes } from '../shared/default-attributes.entity';
import { User } from '../users/user.entity';
import { House } from '../houses/houses.entity';


export type CompanyDocument = Company & Document;

@Schema()
export class Company extends DefaultAttributes {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, default: '' })
  description?: string;

  @Prop({ type: Number, default: 0 })
  star?: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  users?: User[] | Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'House', default: [] })
  houses?: House[] | Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  admin?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastUpdatedBy?: User | Types.ObjectId;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
