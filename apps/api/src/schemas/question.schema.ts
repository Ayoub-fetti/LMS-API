import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true, enum: Object.values(QuestionType) })
  type: QuestionType;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ default: 1 })
  points: number;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
