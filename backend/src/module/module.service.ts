import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module } from '../schemas/module.schema';
import { Course } from '../schemas/course.schema';
import { CreateModuleDto } from '../dto/create-module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>
  ) {}

  async create(createModuleDto: CreateModuleDto, instructorId: string): Promise<Module> {
    await this.verifyCourseOwnership(createModuleDto.course, instructorId);
    
    const order = createModuleDto.order || await this.getNextOrder(createModuleDto.course);
    
    const module = new this.moduleModel({
      ...createModuleDto,
      order
    });
    
    return module.save();
  }

  async update(moduleId: string, updateData: any, instructorId: string): Promise<Module> {
    const module = await this.moduleModel.findById(moduleId);
    if (!module) {
      throw new NotFoundException('Module non trouvé');
    }
    
    await this.verifyCourseOwnership(module.course.toString(), instructorId);
    
    return this.moduleModel.findByIdAndUpdate(moduleId, updateData, { new: true });
  }

  private async verifyCourseOwnership(courseId: string, instructorId: string): Promise<void> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }
    
    if (!course.instructor.equals(instructorId)) {
      throw new ForbiddenException('Accès refusé - Vous n\'êtes pas le propriétaire de ce cours');
    }
  }

  private async getNextOrder(courseId: string): Promise<number> {
    const lastModule = await this.moduleModel
      .findOne({ course: courseId })
      .sort({ order: -1 });
    
    return lastModule ? lastModule.order + 1 : 1;
  }
}
