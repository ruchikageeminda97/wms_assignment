import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../database/entities/user.entity.js';

export class CreateUserDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Jordan Lee' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  fullName!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role!: UserRole;
}
