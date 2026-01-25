import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateRoleDto {
  @IsString()
  userId: string;

  @IsEnum(UserRole)
  role: UserRole;
}
