import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DefaultAttributes } from '../shared/default-attributes.entity';

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
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
