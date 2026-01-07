import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseStatus } from '../schemas/course.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  async findPublished(): Promise<Course[]> {
    return this.courseModel
      .find({ status: CourseStatus.PUBLISHED })
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });
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
