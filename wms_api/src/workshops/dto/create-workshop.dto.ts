import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'POT-101' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  code!: string;

  @ApiProperty({ example: 'Introduction to Pottery' })
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  title!: string;

  @ApiProperty({ example: 'Morgan Chen' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  instructor!: string;

  @ApiProperty({ example: '2026-11-15T09:00:00.000Z' })
  @IsDateString()
  startAt!: string;

  @ApiProperty({ example: 'Room 204' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location!: string;

  @ApiProperty({ example: 20, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;
}
