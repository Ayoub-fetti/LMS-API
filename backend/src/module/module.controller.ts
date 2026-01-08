import { Controller, Post, Put, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    return this.moduleService.findByCourse(courseId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.moduleService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto, @Request() req) {
    return this.moduleService.create(createModuleDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @Request() req) {
    return this.moduleService.update(id, updateModuleDto, req.user._id);
  }
}
