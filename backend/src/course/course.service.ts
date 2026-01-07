import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseStatus } from '../schemas/course.schema';
import { Enrollment } from '../schemas/enrollment.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>
  ) {}

  async findPublished(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [courses, total] = await Promise.all([
      this.courseModel
        .find({ status: CourseStatus.PUBLISHED })
        .populate('instructor', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.courseModel.countDocuments({ status: CourseStatus.PUBLISHED })
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async enroll(courseId: string, studentId: string): Promise<Enrollment> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new ForbiddenException('Ce cours n\'est pas disponible pour inscription');
    }

    const existingEnrollment = await this.enrollmentModel.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      throw new ConflictException('Vous êtes déjà inscrit à ce cours');
    }

    const enrollment = new this.enrollmentModel({
      student: studentId,
      course: courseId
    });

    return enrollment.save();
  }

  async create(createCourseDto: CreateCourseDto, instructorId: string): Promise<Course> {
    const course = new this.courseModel({
      ...createCourseDto,
      instructor: instructorId,
    });
    return course.save();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, instructorId: string): Promise<Course> {
    await this.verifyOwnership(id, instructorId);
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true });
    if (!updatedCourse) {
      throw new NotFoundException('Cours non trouvé');
    }
    return updatedCourse;
  }

  async publish(id: string, instructorId: string): Promise<Course> {
    return this.updateStatus(id, instructorId, CourseStatus.PUBLISHED);
  }

  async unpublish(id: string, instructorId: string): Promise<Course> {
    return this.updateStatus(id, instructorId, CourseStatus.DRAFT);
  }

  private async updateStatus(id: string, instructorId: string, status: CourseStatus): Promise<Course> {
    await this.verifyOwnership(id, instructorId);
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedCourse) {
      throw new NotFoundException('Cours non trouvé');
    }
    return updatedCourse;
  }

  private async verifyOwnership(courseId: string, instructorId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }
    
    if (!course.instructor.equals(instructorId)) {
      throw new ForbiddenException('Accès refusé - Vous n\'êtes pas le propriétaire de ce cours');
    }
    
    return course;
  }
}
