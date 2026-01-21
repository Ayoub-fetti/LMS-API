import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizSubmission } from '../schemas/quiz-submission.schema';
import { Quiz } from '../schemas/quiz.schema';
import { Question } from '../schemas/question.schema';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class QuizSubmissionService {
  constructor(
    @InjectModel(QuizSubmission.name)
    private submissionModel: Model<QuizSubmission>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    private progressService: ProgressService,
  ) {}

  private calculateScore(questions: Question[], answers: any[]) {
    let totalScore = 0;
    let maxScore = 0;

    answers.forEach((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId,
      );
      if (question) {
        maxScore += question.points;
        if (question.correctAnswer === answer.answer) {
          totalScore += question.points;
        }
      }
    });

    return {
      score: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      totalScore,
      maxScore,
    };
  }

  async submitQuiz(quizId: string, studentId: string, answers: any[]) {
    const quiz = await this.quizModel.findById(quizId).populate('module');
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const questions = await this.questionModel.find({ quiz: quizId });

    // Compter les tentatives précédentes
    const previousAttempts = await this.submissionModel.countDocuments({
      quiz: quizId,
      student: studentId,
    });

    const { score } = this.calculateScore(questions, answers);
    const passed = score >= quiz.passingScore;

    const processedAnswers = answers.map((answer) => ({
      question: answer.questionId,
      answer: answer.answer,
    }));

    const submission = await this.submissionModel.create({
      quiz: quizId,
      student: studentId,
      answers: processedAnswers,
      score,
      passed,
      submittedAt: new Date(),
      attemptNumber: previousAttempts + 1,
    });

    // Si le quiz est réussi, marquer le module comme complété
    if (passed && quiz.module) {
      const moduleData: any = quiz.module;
      const moduleId = moduleData._id.toString();
      const courseId = moduleData.course.toString();

      try {
        await this.progressService.completeModule(
          studentId,
          courseId,
          moduleId,
        );
      } catch (error) {
        console.error(
          'Erreur lors de la mise à jour de la progression:',
          error,
        );
      }
    }

    return submission;
  }

  async getAttempts(quizId: string, studentId: string) {
    return this.submissionModel
      .find({
        quiz: quizId,
        student: studentId,
      })
      .sort({ attemptNumber: 1 });
  }
}
