import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ default: CourseStatus.DRAFT, enum: Object.values(CourseStatus) })
  status: CourseStatus;

  @Prop({ default: 0 })
  duration: number; // in minutes

  @Prop({ default: [] })
  tags: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
