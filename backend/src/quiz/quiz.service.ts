import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from '../schemas/quiz.schema';
import { Question } from '../schemas/question.schema';
import { CreateQuizDto } from '../dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    return this.quizModel.create({
      title: createQuizDto.title,
      module: createQuizDto.moduleId,
      timeLimit: createQuizDto.timeLimit || 30,
      passingScore: createQuizDto.passingScore || 70,
    });
  }

  async getQuizForStudent(quizId: string) {
    const quiz = await this.quizModel.findById(quizId).populate('module');
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const questions = await this.questionModel.find({ quiz: quizId }).select('-correctAnswer');
    
    return {
      ...quiz.toObject(),
      questions
    };
  }

  async findByModule(moduleId: string) {
    return this.quizModel.find({ module: moduleId });
  }

  async findById(id: string) {
    return this.quizModel.findById(id).populate('module');
  }
}
