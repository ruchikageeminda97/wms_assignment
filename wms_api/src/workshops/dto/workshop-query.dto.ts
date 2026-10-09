import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkshopStatus } from '../../database/entities/workshop.entity.js';

export class WorkshopQueryDto {
  @ApiPropertyOptional({ example: '2026-10-12' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-18' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: WorkshopStatus })
  @IsOptional()
  @IsEnum(WorkshopStatus)
  status?: WorkshopStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  hasSeats?: boolean;

  @ApiPropertyOptional({ example: 'pottery' })
  @IsOptional()
  @IsString()
  search?: string;
}
