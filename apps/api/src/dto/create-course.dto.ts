import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsString({ message: 'Titre doit être une chaîne' })
  @IsNotEmpty({ message: 'Titre requis' })
  title: string;

  @IsString({ message: 'Description doit être une chaîne' })
  @IsNotEmpty({ message: 'Description requise' })
  description: string;

  @IsOptional()
  @IsNumber({}, { message: 'Durée doit être un nombre' })
  @Min(0, { message: 'Durée doit être positive' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Tags doit être un tableau' })
  @IsString({ each: true, message: 'Chaque tag doit être une chaîne' })
  tags?: string[];
}
