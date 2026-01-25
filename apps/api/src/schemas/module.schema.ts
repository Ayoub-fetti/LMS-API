import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Module extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ required: true })
  order: number;

  @Prop({ default: ModuleStatus.DRAFT, enum: Object.values(ModuleStatus) })
  status: ModuleStatus;

  @Prop({ default: 0 })
  duration: number; // in minutes

  @Prop({ default: [] })
  objectives: string[];
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

// Index pour assurer l'unicité de l'ordre par cours
ModuleSchema.index({ course: 1, order: 1 }, { unique: true });
