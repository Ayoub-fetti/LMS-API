import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDefinition } from '../schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaDefinition },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}