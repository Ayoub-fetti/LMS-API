import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  IsMongoId,
} from 'class-validator';

export class CreateModuleDto {
  @IsString({ message: 'Titre doit être une chaîne' })
  @IsNotEmpty({ message: 'Titre requis' })
  title: string;

  @IsString({ message: 'Description doit être une chaîne' })
  @IsNotEmpty({ message: 'Description requise' })
  description: string;

  @IsMongoId({ message: 'ID cours invalide' })
  course: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ordre doit être un nombre' })
  @Min(1, { message: 'Ordre doit être positif' })
  order?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Durée doit être un nombre' })
  @Min(0, { message: 'Durée doit être positive' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Objectifs doit être un tableau' })
  @IsString({ each: true, message: 'Chaque objectif doit être une chaîne' })
  objectives?: string[];
}
