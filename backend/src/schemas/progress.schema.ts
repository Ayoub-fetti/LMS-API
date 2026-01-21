import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Progress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Module' })
  currentModule: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Module' }], default: [] })
  completedModules: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quiz' }], default: [] })
  completedQuizzes: Types.ObjectId[];

  @Prop({ default: 0, min: 0, max: 100 })
  completionPercentage: number;

  @Prop({ default: Date.now })
  lastAccessedAt: Date;

  @Prop({ default: 0 })
  totalTimeSpent: number; // en minutes
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Index pour assurer l'unicité de la progression par étudiant et cours
ProgressSchema.index({ student: 1, course: 1 }, { unique: true });

// Index pour optimiser les requêtes par cours
ProgressSchema.index({ course: 1 });

// Index pour optimiser les requêtes par étudiant
ProgressSchema.index({ student: 1 });
