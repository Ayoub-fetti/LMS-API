import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuestionController } from './question.controller';
import { QuizSubmissionService } from './quiz-submission.service';
import { QuizService } from './quiz.service';
import { QuestionService } from './question.service';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';
import { QuizSubmission, QuizSubmissionSchema } from '../schemas/quiz-submission.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    ProgressModule,
  ],
  controllers: [QuizController, QuestionController],
  providers: [QuizSubmissionService, QuizService, QuestionService],
})
export class QuizModule {}