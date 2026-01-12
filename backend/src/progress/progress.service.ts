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
      .findOne({ course: courseId })
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

    // Calculer le pourcentage de complétion
    const totalModules = await this.moduleModel.countDocuments({ course: courseId });
    progress.completionPercentage = Math.round(
      (progress.completedModules.length / totalModules) * 100,
    );

    // Passer au module suivant
    const currentModule = await this.moduleModel.findById(moduleId);
    const nextModule = await this.moduleModel
      .findOne({
        course: courseId,
        order: { $gt: currentModule?.order || 0 },
      })
      .sort({ order: 1 });

    if (nextModule) {
      progress.currentModule = nextModule._id as any;
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
}