import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Enrollment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ default: Date.now })
  enrolledAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Create compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
