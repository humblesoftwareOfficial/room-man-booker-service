import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DefaultAttributes } from '../shared/default-attributes.entity';
import { EAccountType, EUserGender } from 'src/features/users/users.helper';
import { Company } from '../companies/companies.entity';
import { Types } from 'mongoose';
import { House } from '../houses/houses.entity';

export type UserDocument = User & Document;

@Schema({})
export class User extends DefaultAttributes {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ type: String, unique: true, sparse: true })
  phone: string;

  @Prop({ type: String, unique: true, sparse: true })
  email?: string;

  @Prop({ type: String, enum: EUserGender, default: null })
  gender: EUserGender;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ type: String, default: '' })
  address?: string;

  @Prop({ type: [], default: [] })
  push_tokens: string[];

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  company?: Company | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'House', default: null })
  house?: House | Types.ObjectId;

  @Prop({ type: String, enum: EAccountType, required: true })
  account_type: EAccountType;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy?: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastUpdatedBy?: User | Types.ObjectId;

  @Prop({ required: true, type: String })
  defaultPassword: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
