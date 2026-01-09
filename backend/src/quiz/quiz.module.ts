import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizSubmissionService } from './quiz-submission.service';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';
import { QuizSubmission, QuizSubmissionSchema } from '../schemas/quiz-submission.schema';
import { QuizService } from './quiz.service';
import { Question, QuestionSchema } from '../schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizSubmissionService, QuizService],
})
export class QuizModule {}
