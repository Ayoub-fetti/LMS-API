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

  private calculateScore(questions: Question[], answers: any[]) {
    let totalScore = 0;
    let maxScore = 0;

    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
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
      maxScore
    };
  }

  async submitQuiz(quizId: string, studentId: string, answers: any[]) {
    const quiz = await this.quizModel.findById(quizId);
    const questions = await this.questionModel.find({ quiz: quizId });
    
    const { score } = this.calculateScore(questions, answers);
    const passed = score >= quiz.passingScore;

    const processedAnswers = answers.map(answer => ({
      question: answer.questionId,
      answer: answer.answer
    }));

    return this.submissionModel.create({
      quiz: quizId,
      student: studentId,
      answers: processedAnswers,
      score,
      passed,
      submittedAt: new Date()
    });
  }
}
