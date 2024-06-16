/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediasDocument = Medias & Document;

@Schema({ _id: false })
export class Medias {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  url: string;
}
