import { Controller, Post, Put, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.courseService.create(createCourseDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.courseService.update(id, updateCourseDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id/publish')
  async publish(@Param('id') id: string, @Request() req) {
    return this.courseService.publish(id, req.user._id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string, @Request() req) {
    return this.courseService.unpublish(id, req.user._id);
  }
}
