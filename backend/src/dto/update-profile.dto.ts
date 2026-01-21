import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Prénom doit être une chaîne' })
  @IsNotEmpty({ message: 'Prénom ne peut pas être vide' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Nom doit être une chaîne' })
  @IsNotEmpty({ message: 'Nom ne peut pas être vide' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Mot de passe doit être une chaîne' })
  @MinLength(6, { message: 'Mot de passe doit contenir au moins 6 caractères' })
  password?: string;
}
