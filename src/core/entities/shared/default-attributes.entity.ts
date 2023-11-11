import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DefaultAttributesDocument = DefaultAttributes & Document;

@Schema({ _id: false })
export class DefaultAttributes {
  @Prop({ required: true, type: String, unique: true })
  code: string;

  @Prop({ required: true, type: Date, default: new Date() })
  createdAt?: Date;

  @Prop({ required: true, type: Date, default: new Date() })
  lastUpdatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}
