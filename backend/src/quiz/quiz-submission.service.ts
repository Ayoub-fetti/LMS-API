import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizSubmission } from '../schemas/quiz-submission.schema';
import { Quiz } from '../schemas/quiz.schema';
import { Question } from '../schemas/question.schema';

@Injectable()
export class QuizSubmissionService {
  constructor(
    @InjectModel(QuizSubmission.name) private submissionModel: Model<QuizSubmission>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async submitQuiz(quizId: string, studentId: string, answers: any[]) {
    const quiz = await this.quizModel.findById(quizId);
    const questions = await this.questionModel.find({ quiz: quizId });
    
    let totalScore = 0;
    let maxScore = 0;

    const processedAnswers = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      maxScore += question.points;
      
      if (question.correctAnswer === answer.answer) {
        totalScore += question.points;
      }

      return {
        question: answer.questionId,
        answer: answer.answer
      };
    });

    const scorePercentage = (totalScore / maxScore) * 100;
    const passed = scorePercentage >= quiz.passingScore;

    return this.submissionModel.create({
      quiz: quizId,
      student: studentId,
      answers: processedAnswers,
      score: scorePercentage,
      passed,
      submittedAt: new Date()
    });
  }
}
