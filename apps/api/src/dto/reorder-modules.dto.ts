import { IsArray, IsString, IsNumber } from 'class-validator';

export class ModuleOrderDto {
  @IsString()
  moduleId: string;

  @IsNumber()
  order: number;
}

export class ReorderModulesDto {
  @IsArray()
  modules: ModuleOrderDto[];
}
