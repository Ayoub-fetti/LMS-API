import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { QuizSubmissionService } from './quiz-submission.service';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    private readonly quizSubmissionService: QuizSubmissionService,
    private readonly quizService: QuizService,
  ) {}

  @Post()
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get(':id')
  async getQuiz(@Param('id') quizId: string) {
    return this.quizService.getQuizForStudent(quizId);
  }

  @Post(':id/submit')
  async submitQuiz(
    @Param('id') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req: any,
  ) {
    console.log('User from request:', req.user);
    return this.quizSubmissionService.submitQuiz(
      quizId,
      req.user._id || req.user.id,
      submitQuizDto.answers,
    );
  }

  @Get(':id/attempts')
  async getAttempts(
    @Param('id') quizId: string,
    @Request() req: any,
  ) {
    return this.quizSubmissionService.getAttempts(quizId, req.user._id || req.user.id);
  }
}
