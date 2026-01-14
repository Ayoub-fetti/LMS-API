import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseStatus } from '../schemas/course.schema';
import { Enrollment } from '../schemas/enrollment.schema';
import { Progress } from '../schemas/progress.schema';
import { QuizSubmission } from '../schemas/quiz-submission.schema';
import { Module } from '../schemas/module.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(Progress.name) private progressModel: Model<Progress>,
    @InjectModel(QuizSubmission.name) private quizSubmissionModel: Model<QuizSubmission>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
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

  async findById(courseId: string): Promise<Course> {
    await this.verifyVisibility(courseId);
    
    const course = await this.courseModel
      .findById(courseId)
      .populate('instructor', 'firstName lastName email');
      
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }
    
    return course;
  }

  async enroll(courseId: string, studentId: string): Promise<{ enrollment: Enrollment; message: string }> {
    await this.verifyVisibility(courseId);

    try {
      const enrollment = new this.enrollmentModel({
        student: studentId,
        course: courseId
      });

      await enrollment.save();

      return {
        enrollment,
        message: 'Inscription réussie'
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Vous êtes déjà inscrit à ce cours');
      }
      throw error;
    }
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

  /**
   * Récupère la liste des apprenants inscrits à un cours avec leur progression
   */
  async getStudentsProgress(courseId: string, instructorId: string): Promise<any> {
    // Vérifier que le formateur est bien le propriétaire du cours
    await this.verifyOwnership(courseId, instructorId);

    // Récupérer tous les modules du cours
    const modules = await this.moduleModel
      .find({ course: courseId, status: { $ne: 'archived' } })
      .sort({ order: 1 })
      .select('_id title order');

    // Récupérer tous les apprenants inscrits
    const enrollments = await this.enrollmentModel
      .find({ course: courseId })
      .populate('student', 'firstName lastName email')
      .sort({ enrolledAt: -1 });

    if (enrollments.length === 0) {
      return {
        course: await this.courseModel.findById(courseId).select('title description'),
        totalStudents: 0,
        students: [],
        modules: modules.map(m => ({
          id: m._id,
          title: m.title,
          order: m.order
        }))
      };
    }

    // Récupérer la progression de chaque apprenant
    const studentsProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.student._id.toString();
        
        // Progression générale
        const progress = await this.progressModel
          .findOne({ student: studentId, course: courseId })
          .populate('currentModule', 'title order')
          .populate('completedModules', 'title order')
          .populate('completedQuizzes', 'title');

        // Résultats des quiz
        const quizSubmissions = await this.quizSubmissionModel
          .find({ student: studentId })
          .populate({
            path: 'quiz',
            match: { module: { $in: modules.map(m => m._id) } },
            select: 'title module passingScore'
          })
          .sort({ attemptNumber: 1 });

        // Filtrer les soumissions qui correspondent au cours
        const courseQuizSubmissions = quizSubmissions.filter(sub => sub.quiz !== null);

        // Calculer les statistiques des modules
        const moduleStats = modules.map(module => {
          const isCompleted = progress?.completedModules.some(
            (cm: any) => cm._id.toString() === module._id.toString()
          ) || false;
          
          const isCurrent = progress?.currentModule?._id.toString() === module._id.toString();

          return {
            moduleId: module._id,
            title: module.title,
            order: module.order,
            isCompleted,
            isCurrent
          };
        });

        // Calculer les statistiques des quiz
        const quizStats = courseQuizSubmissions.map(submission => {
          const quiz = submission.quiz as any;
          return {
            quizId: submission.quiz._id,
            quizTitle: quiz.title,
            moduleId: quiz.module,
            score: submission.score,
            passed: submission.passed,
            passingScore: quiz.passingScore,
            attemptNumber: submission.attemptNumber,
            submittedAt: submission.submittedAt
          };
        });

        // Calculer les moyennes
        const averageQuizScore = quizStats.length > 0
          ? quizStats.reduce((sum, q) => sum + q.score, 0) / quizStats.length
          : 0;

        const passedQuizzes = quizStats.filter(q => q.passed).length;
        const totalQuizzes = progress?.completedQuizzes.length || 0;

        return {
          student: {
            id: enrollment.student._id,
            firstName: enrollment.student.firstName,
            lastName: enrollment.student.lastName,
            email: enrollment.student.email,
            enrolledAt: enrollment.enrolledAt
          },
          progress: {
            completionPercentage: progress?.completionPercentage || 0,
            completedModules: progress?.completedModules.length || 0,
            totalModules: modules.length,
            currentModule: progress?.currentModule ? {
              id: progress.currentModule._id,
              title: progress.currentModule.title,
              order: progress.currentModule.order
            } : null,
            lastAccessedAt: progress?.lastAccessedAt,
            totalTimeSpent: progress?.totalTimeSpent || 0
          },
          quizzes: {
            total: totalQuizzes,
            passed: passedQuizzes,
            failed: totalQuizzes - passedQuizzes,
            averageScore: Math.round(averageQuizScore),
            details: quizStats
          },
          modules: moduleStats
        };
      })
    );

    // Calculer les statistiques globales
    const globalStats = {
      totalStudents: enrollments.length,
      averageCompletion: studentsProgress.length > 0
        ? Math.round(
            studentsProgress.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / 
            studentsProgress.length
          )
        : 0,
      studentsCompleted: studentsProgress.filter(s => s.progress.completionPercentage === 100).length,
      studentsInProgress: studentsProgress.filter(
        s => s.progress.completionPercentage > 0 && s.progress.completionPercentage < 100
      ).length,
      studentsNotStarted: studentsProgress.filter(s => s.progress.completionPercentage === 0).length,
      averageQuizScore: studentsProgress.length > 0
        ? Math.round(
            studentsProgress.reduce((sum, s) => sum + s.quizzes.averageScore, 0) / 
            studentsProgress.length
          )
        : 0
    };

    return {
      course: await this.courseModel.findById(courseId).select('title description status'),
      statistics: globalStats,
      modules: modules.map(m => ({
        id: m._id,
        title: m.title,
        order: m.order
      })),
      students: studentsProgress
    };
  }

  private async updateStatus(id: string, instructorId: string, status: CourseStatus): Promise<Course> {
    await this.verifyOwnership(id, instructorId);
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedCourse) {
      throw new NotFoundException('Cours non trouvé');
    }
    return updatedCourse;
  }

  private async verifyVisibility(courseId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }
    
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new ForbiddenException('Ce cours n\'est pas disponible');
    }
    
    return course;
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