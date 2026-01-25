import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module: Types.ObjectId;

  @Prop({ default: 30 })
  timeLimit: number;

  @Prop({ default: 70 })
  passingScore: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
