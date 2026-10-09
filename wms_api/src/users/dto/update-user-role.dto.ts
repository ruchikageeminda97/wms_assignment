import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity.js';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  role!: UserRole;
}
