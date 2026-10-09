import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RegistrationStatus } from '../../database/entities/registration.entity.js';

export class RegistrationQueryDto {
  @ApiPropertyOptional({ enum: RegistrationStatus })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;
}
