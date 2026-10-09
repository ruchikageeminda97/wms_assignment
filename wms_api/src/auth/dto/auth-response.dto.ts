import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../database/entities/user.entity.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class AuthProfileDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ example: 'System Administrator' })
  fullName!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}
