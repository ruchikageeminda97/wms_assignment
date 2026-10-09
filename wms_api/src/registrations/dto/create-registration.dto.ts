import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  workshopId!: number;

  @ApiProperty({ example: 'Taylor Rivera' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  attendeeName!: string;

  @ApiProperty({ example: 'taylor@example.com' })
  @IsEmail()
  @MaxLength(255)
  attendeeEmail!: string;
}
