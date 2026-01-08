import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDefinition } from '../schemas/module.schema';
import { Course, CourseSchema } from '../schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleSchema.name, schema: ModuleSchemaDefinition },
      { name: Course.name, schema: CourseSchema }
    ])
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}
