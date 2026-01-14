import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Enrollment, EnrollmentSchema } from '../schemas/enrollment.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { QuizSubmission, QuizSubmissionSchema } from '../schemas/quiz-submission.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDefinition } from '../schemas/module.schema';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaDefinition },
    ]),
    ProgressModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}