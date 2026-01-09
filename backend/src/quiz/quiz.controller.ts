import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizSubmissionService } from './quiz-submission.service';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizSubmissionService: QuizSubmissionService) {}

  @Post(':id/submit')
  async submitQuiz(
    @Param('id') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req: any,
  ) {
    return this.quizSubmissionService.submitQuiz(
      quizId,
      req.user.userId,
      submitQuizDto.answers,
    );
  }

  @Get(':id/attempts')
  async getAttempts(
    @Param('id') quizId: string,
    @Request() req: any,
  ) {
    return this.quizSubmissionService.getAttempts(quizId, req.user.userId);
  }

}
