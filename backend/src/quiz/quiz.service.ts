import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from '../schemas/quiz.schema';
import { CreateQuizDto } from '../dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    return this.quizModel.create({
      title: createQuizDto.title,
      module: createQuizDto.moduleId,
      timeLimit: createQuizDto.timeLimit || 30,
      passingScore: createQuizDto.passingScore || 70,
    });
  }

  async findByModule(moduleId: string) {
    return this.quizModel.find({ module: moduleId });
  }

  async findById(id: string) {
    return this.quizModel.findById(id).populate('module');
  }
}
