import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesGuard } from './role.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    const { password, ...user } = req.user.toObject();
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user._id, updateProfileDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.authService.updateUserRole(userId, updateRoleDto.role);
  }
}
