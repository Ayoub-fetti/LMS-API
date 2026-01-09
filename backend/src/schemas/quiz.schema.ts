import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer'
}

@Schema()
export class Question {
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
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module: Types.ObjectId;

  @Prop({ type: [Question], required: true })
  questions: Question[];

  @Prop({ default: 30 })
  timeLimit: number; // en minutes

  @Prop({ default: 70 })
  passingScore: number; // pourcentage requis pour valider
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
