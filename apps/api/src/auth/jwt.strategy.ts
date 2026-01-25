import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
      ignoreExpiration: false, // check automatiquement l'expiration
    });
  }

  async validate(payload: any) {
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new UnauthorizedException('Token expiré');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur introuvable ou inactif');
    }
    return user;
  }
}
