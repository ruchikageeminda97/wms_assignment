import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../database/entities/user.entity.js';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'staff@example.com' })
  email!: string;

  @ApiProperty({ example: 'Jordan Lee' })
  fullName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  role!: UserRole;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-10-09T12:00:00.000Z' })
  createdAt!: Date;
}
