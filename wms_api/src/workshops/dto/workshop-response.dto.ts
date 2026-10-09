import { ApiProperty } from '@nestjs/swagger';
import { WorkshopStatus } from '../../database/entities/workshop.entity.js';

export class WorkshopResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'POT-101' })
  code!: string;

  @ApiProperty({ example: 'Introduction to Pottery' })
  title!: string;

  @ApiProperty({ example: 'Morgan Chen' })
  instructor!: string;

  @ApiProperty({ example: '2026-11-15T09:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: 'Room 204' })
  location!: string;

  @ApiProperty({ example: 20 })
  capacity!: number;

  @ApiProperty({ example: 12 })
  activeCount!: number;

  @ApiProperty({ example: 8 })
  seatsAvailable!: number;

  @ApiProperty({ enum: WorkshopStatus })
  status!: WorkshopStatus;

  @ApiProperty({ example: 1 })
  createdBy!: number;

  @ApiProperty({ example: '2026-10-09T12:00:00.000Z' })
  createdAt!: Date;
}
