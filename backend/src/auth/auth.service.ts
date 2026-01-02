import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.register(registerDto);
    const token = this.generateToken(user);
    const { password, ...result } = user.toObject();
    
    return {
      message: 'Utilisateur créé avec succès',
      user: result,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.login(loginDto);
    const token = this.generateToken(user);
    const { password, ...result } = user.toObject();
    
    return {
      message: 'Connexion réussie',
      user: result,
      access_token: token,
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
