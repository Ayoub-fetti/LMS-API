import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  IsEnum,
} from 'class-validator';
import { CourseStatus } from '../schemas/course.schema';

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'Titre doit être une chaîne' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description doit être une chaîne' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Durée doit être un nombre' })
  @Min(0, { message: 'Durée doit être positive' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Tags doit être un tableau' })
  @IsString({ each: true, message: 'Chaque tag doit être une chaîne' })
  tags?: string[];

  @IsOptional()
  @IsEnum(CourseStatus, { message: 'Statut invalide' })
  status?: CourseStatus;
}
