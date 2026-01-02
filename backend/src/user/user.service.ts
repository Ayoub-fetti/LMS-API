import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async login(loginDto: LoginDto): Promise<User> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  }
}
