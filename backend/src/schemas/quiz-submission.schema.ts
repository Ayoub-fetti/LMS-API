import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  question: Types.ObjectId;

  @Prop({ required: true })
  answer: string;
}

@Schema({ timestamps: true })
export class QuizSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: [Answer], required: true })
  answers: Answer[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true })
  submittedAt: Date;
}

export const QuizSubmissionSchema = SchemaFactory.createForClass(QuizSubmission);
