import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.userService.register(registerDto);
    const { password, ...result } = user.toObject();
    return { message: 'Utilisateur créé avec succès', user: result };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.login(loginDto);
    const { password, ...result } = user.toObject();
    return { message: 'Connexion réussie', user: result };
  }
}
