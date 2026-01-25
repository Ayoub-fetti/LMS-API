import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }
}
