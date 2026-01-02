import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString({ message: 'Mot de passe doit être une chaîne' })
  @MinLength(6, { message: 'Mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;

  @IsString({ message: 'Prénom doit être une chaîne' })
  @IsNotEmpty({ message: 'Prénom requis' })
  firstName: string;

  @IsString({ message: 'Nom doit être une chaîne' })
  @IsNotEmpty({ message: 'Nom requis' })
  lastName: string;

  @IsOptional()
  @IsEnum(['student', 'instructor'], { message: 'Rôle doit être student ou instructor' })
  role?: string = 'student';
}
