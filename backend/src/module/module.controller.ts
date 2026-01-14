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

  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string, @Request() req: any) {
    // Passer le studentId pour obtenir les informations d'accès
    return this.moduleService.findByCourse(courseId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    // Vérifier l'accès au module pour les étudiants
    if (req.user.role === UserRole.STUDENT) {
      return this.moduleService.findById(id, req.user._id);
    }
    return this.moduleService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto, @Request() req: any) {
    return this.moduleService.create(createModuleDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @Request() req: any) {
    return this.moduleService.update(id, updateModuleDto, req.user._id);
  }
}