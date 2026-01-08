import { IsOptional, IsString, IsNumber, IsArray, Min, IsEnum } from 'class-validator';
import { ModuleStatus } from '../schemas/module.schema';

export class UpdateModuleDto {
  @IsOptional()
  @IsString({ message: 'Titre doit être une chaîne' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description doit être une chaîne' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ordre doit être un nombre' })
  @Min(1, { message: 'Ordre doit être positif' })
  order?: number;

  @IsOptional()
  @IsEnum(ModuleStatus, { message: 'Statut invalide' })
  status?: ModuleStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Durée doit être un nombre' })
  @Min(0, { message: 'Durée doit être positive' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Objectifs doit être un tableau' })
  @IsString({ each: true, message: 'Chaque objectif doit être une chaîne' })
  objectives?: string[];
}
