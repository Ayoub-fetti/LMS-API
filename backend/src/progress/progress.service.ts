import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress } from '../schemas/progress.schema';
import { Module } from '../schemas/module.schema';
import { Quiz } from '../schemas/quiz.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<Progress>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
  ) {}

  async initializeProgress(studentId: string, courseId: string): Promise<Progress> {
    // Vérifier si une progression existe déjà
    const existingProgress = await this.progressModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingProgress) {
      return existingProgress;
    }

    // Récupérer le premier module du cours
    const firstModule = await this.moduleModel
      .findOne({ course: courseId, status: { $ne: 'archived' } })
      .sort({ order: 1 });

    // Créer la progression initiale
    const progress = new this.progressModel({
      student: studentId,
      course: courseId,
      currentModule: firstModule?._id || null,
      completedModules: [],
      completedQuizzes: [],
      completionPercentage: 0,
      lastAccessedAt: new Date(),
      totalTimeSpent: 0,
    });

    return progress.save();
  }

  async getProgress(studentId: string, courseId: string): Promise<Progress | null> {
    return this.progressModel
      .findOne({ student: studentId, course: courseId })
      .populate('currentModule')
      .populate('completedModules')
      .populate('completedQuizzes');
  }

  async getDetailedProgress(studentId: string, courseId: string): Promise<any> {
    const progress = await this.progressModel
      .findOne({ student: studentId, course: courseId })
      .populate('currentModule')
      .populate('completedModules')
      .populate('completedQuizzes');

    if (!progress) {
      throw new NotFoundException('Progression non trouvée');
    }

    // Récupérer tous les modules du cours
    const allModules = await this.moduleModel
      .find({ course: courseId, status: { $ne: 'archived' } })
      .sort({ order: 1 });

    // Calculer des statistiques détaillées
    const totalModules = allModules.length;
    const completedModules = progress.completedModules.length;
    const remainingModules = totalModules - completedModules;

    // Calculer le temps estimé restant
    const estimatedTimeRemaining = allModules
      .filter(module => 
        !progress.completedModules.some(id => id.toString() === module._id.toString())
      )
      .reduce((total, module) => total + (module.duration || 0), 0);

    return {
      ...progress.toObject(),
      statistics: {
        totalModules,
        completedModules,
        remainingModules,
        completionPercentage: progress.completionPercentage,
        totalTimeSpent: progress.totalTimeSpent,
        estimatedTimeRemaining,
        lastAccessedAt: progress.lastAccessedAt,
      },
      modulesList: allModules.map(module => ({
        _id: module._id,
        title: module.title,
        order: module.order,
        duration: module.duration,
        isCompleted: progress.completedModules.some(
          id => id.toString() === module._id.toString()
        ),
        isCurrent: progress.currentModule?.toString() === module._id.toString(),
      })),
    };
  }

  async updateCurrentModule(
    studentId: string,
    courseId: string,
    moduleId: string,
  ): Promise<Progress> {
    const progress = await this.progressModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      throw new NotFoundException('Progression non trouvée');
    }

    progress.currentModule = moduleId as any;
    progress.lastAccessedAt = new Date();

    return progress.save();
  }

  async completeModule(
    studentId: string,
    courseId: string,
    moduleId: string,
  ): Promise<Progress> {
    const progress = await this.progressModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      throw new NotFoundException('Progression non trouvée');
    }

    // Vérifier si le module a un quiz associé
    const quiz = await this.quizModel.findOne({ module: moduleId });
    
    // Ajouter le module aux modules complétés s'il n'y est pas déjà
    if (!progress.completedModules.includes(moduleId as any)) {
      progress.completedModules.push(moduleId as any);
    }

    // Ajouter le quiz aux quiz complétés si le module en a un
    if (quiz && !progress.completedQuizzes.includes(quiz._id as any)) {
      progress.completedQuizzes.push(quiz._id as any);
    }

    // Recalculer la progression globale
    await this.updateCompletionPercentage(progress, courseId);

    // Passer au module suivant
    const currentModule = await this.moduleModel.findById(moduleId);
    const nextModule = await this.moduleModel
      .findOne({
        course: courseId,
        order: { $gt: currentModule?.order || 0 },
        status: { $ne: 'archived' },
      })
      .sort({ order: 1 });

    if (nextModule) {
      progress.currentModule = nextModule._id as any;
    } else {
      // Si plus de module suivant, le cours est terminé
      progress.completionPercentage = 100;
    }

    progress.lastAccessedAt = new Date();

    return progress.save();
  }

  async completeQuiz(
    studentId: string,
    courseId: string,
    quizId: string,
  ): Promise<Progress> {
    const progress = await this.progressModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      throw new NotFoundException('Progression non trouvée');
    }

    // Ajouter le quiz aux quiz complétés s'il n'y est pas déjà
    if (!progress.completedQuizzes.includes(quizId as any)) {
      progress.completedQuizzes.push(quizId as any);
    }

    progress.lastAccessedAt = new Date();

    return progress.save();
  }

  async updateTimeSpent(
    studentId: string,
    courseId: string,
    minutes: number,
  ): Promise<Progress> {
    const progress = await this.progressModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      throw new NotFoundException('Progression non trouvée');
    }

    progress.totalTimeSpent += minutes;
    progress.lastAccessedAt = new Date();

    return progress.save();
  }

  private async updateCompletionPercentage(
    progress: Progress,
    courseId: string,
  ): Promise<void> {
    // Compter le nombre total de modules du cours (non archivés)
    const totalModules = await this.moduleModel.countDocuments({ 
      course: courseId,
      status: { $ne: 'archived' }
    });

    if (totalModules === 0) {
      progress.completionPercentage = 0;
      return;
    }

    // Calculer le pourcentage basé sur les modules complétés
    const completedCount = progress.completedModules.length;
    progress.completionPercentage = Math.round((completedCount / totalModules) * 100);
    
    // S'assurer que le pourcentage ne dépasse pas 100
    if (progress.completionPercentage > 100) {
      progress.completionPercentage = 100;
    }
  }
}