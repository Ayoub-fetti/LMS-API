import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module } from '../schemas/module.schema';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<Module>
  ) {}

  async reorderModules(courseId: string, moduleOrders: { moduleId: string; order: number }[]): Promise<Module[]> {
    const session = await this.moduleModel.db.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const { moduleId, order } of moduleOrders) {
          await this.moduleModel.findByIdAndUpdate(
            moduleId,
            { order },
            { session }
          );
        }
      });

      return this.moduleModel
        .find({ course: courseId })
        .sort({ order: 1 });
    } finally {
      await session.endSession();
    }
  }

  async getNextOrder(courseId: string): Promise<number> {
    const lastModule = await this.moduleModel
      .findOne({ course: courseId })
      .sort({ order: -1 });
    
    return lastModule ? lastModule.order + 1 : 1;
  }
}
