import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module } from '../schemas/module.schema';
import { Course } from '../schemas/course.schema';
import { Progress } from '../schemas/progress.schema';
import { CreateModuleDto } from '../dto/create-module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Progress.name) private progressModel: Model<Progress>,
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
    
    const updatedModule = await this.moduleModel.findByIdAndUpdate(
      moduleId, 
      updateData, 
      { new: true }
    );
    
    if (!updatedModule) {
      throw new NotFoundException('Module non trouvé');
    }
    
    return updatedModule;
  }

  async findById(moduleId: string, studentId?: string): Promise<Module> {
    const module = await this.moduleModel.findById(moduleId);
    if (!module) {
      throw new NotFoundException('Module non trouvé');
    }

    // Si un studentId est fourni, vérifier l'accès
    if (studentId) {
      await this.verifyModuleAccess(moduleId, studentId);
    }

    return module;
  }

  async findByCourse(courseId: string, studentId?: string): Promise<any[]> {
    const modules = await this.moduleModel
      .find({ course: courseId, status: { $ne: 'archived' } })
      .sort({ order: 1 });

    // Si un studentId est fourni, ajouter les informations d'accès
    if (studentId) {
      const progress = await this.progressModel.findOne({
        student: studentId,
        course: courseId,
      });

      if (progress) {
        // Recalculer la progression si nécessaire
        const totalModules = modules.length;
        const completedCount = progress.completedModules.length;
        const calculatedPercentage = totalModules > 0 
          ? Math.round((completedCount / totalModules) * 100) 
          : 0;

        // Mettre à jour si différent
        if (progress.completionPercentage !== calculatedPercentage) {
          progress.completionPercentage = calculatedPercentage;
          await progress.save();
        }

        return modules.map((module) => {
          const moduleObj = module.toObject();
          const isCompleted = progress.completedModules.some(
            (id) => id.toString() === module._id.toString()
          );
          const isCurrent = progress.currentModule?.toString() === module._id.toString();
          
          return {
            ...moduleObj,
            isLocked: !this.isModuleAccessible(module._id.toString(), progress),
            isCompleted,
            isCurrent,
            // Indiquer si c'est le point de reprise
            isResumePoint: isCurrent && !isCompleted,
          };
        });
      }

      // Si pas de progression, seul le premier module est accessible
      return modules.map((module, index) => {
        const moduleObj = module.toObject();
        return {
          ...moduleObj,
          isLocked: index !== 0,
          isCompleted: false,
          isCurrent: index === 0,
          isResumePoint: index === 0,
        };
      });
    }

    return modules;
  }

  async delete(moduleId: string, instructorId: string): Promise<void> {
    const module = await this.moduleModel.findById(moduleId);
    if (!module) {
      throw new NotFoundException('Module non trouvé');
    }
    
    await this.verifyCourseOwnership(module.course.toString(), instructorId);
    
    await this.moduleModel.findByIdAndDelete(moduleId);
  }

  private async verifyModuleAccess(moduleId: string, studentId: string): Promise<void> {
    const module = await this.moduleModel.findById(moduleId);
    if (!module) {
      throw new NotFoundException('Module non trouvé');
    }

    const progress = await this.progressModel.findOne({
      student: studentId,
      course: module.course,
    });

    if (!progress) {
      throw new ForbiddenException('Vous devez être inscrit à ce cours');
    }

    if (!this.isModuleAccessible(moduleId, progress)) {
      throw new ForbiddenException(
        'Ce module est verrouillé. Vous devez compléter le module précédent.'
      );
    }
  }

  private isModuleAccessible(moduleId: string, progress: any): boolean {
    // Le module est accessible si :
    // 1. C'est le module actuel
    if (progress.currentModule?.toString() === moduleId) {
      return true;
    }

    // 2. Le module a déjà été complété
    if (progress.completedModules.some((id: any) => id.toString() === moduleId)) {
      return true;
    }

    return false;
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