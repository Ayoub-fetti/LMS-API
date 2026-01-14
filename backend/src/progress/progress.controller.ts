import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('course/:courseId')
  async getProgress(@Param('courseId') courseId: string, @Request() req: any) {
    return this.progressService.getProgress(req.user._id, courseId);
  }

  @Get('course/:courseId/detailed')
  async getDetailedProgress(@Param('courseId') courseId: string, @Request() req: any) {
    return this.progressService.getDetailedProgress(req.user._id, courseId);
  }

  @Put('course/:courseId/module/:moduleId')
  async updateCurrentModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Request() req: any,
  ) {
    return this.progressService.updateCurrentModule(req.user._id, courseId, moduleId);
  }

  @Put('course/:courseId/module/:moduleId/complete')
  async completeModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Request() req: any,
  ) {
    return this.progressService.completeModule(req.user._id, courseId, moduleId);
  }

  @Put('course/:courseId/time')
  async updateTimeSpent(
    @Param('courseId') courseId: string,
    @Body('minutes') minutes: number,
    @Request() req: any,
  ) {
    return this.progressService.updateTimeSpent(req.user._id, courseId, minutes);
  }
}