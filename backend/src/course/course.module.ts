import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Enrollment, EnrollmentSchema } from '../schemas/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema }
    ])
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
