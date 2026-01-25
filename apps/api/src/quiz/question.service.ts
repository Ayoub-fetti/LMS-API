import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../schemas/question.schema';
import { CreateQuestionDto } from '../dto/create-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    return this.questionModel.create({
      text: createQuestionDto.text,
      type: createQuestionDto.type,
      options: createQuestionDto.options,
      correctAnswer: createQuestionDto.correctAnswer,
      points: createQuestionDto.points || 1,
      quiz: createQuestionDto.quizId,
    });
  }
}
