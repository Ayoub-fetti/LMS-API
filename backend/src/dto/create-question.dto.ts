import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { QuestionType } from '../schemas/question.schema';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsString()
  @IsNotEmpty()
  quizId: string;
}
