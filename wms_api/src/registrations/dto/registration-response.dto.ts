import { ApiProperty } from '@nestjs/swagger';
import { RegistrationStatus } from '../../database/entities/registration.entity.js';

export class RegistrationResponseDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 3 })
  workshopId!: number;

  @ApiProperty({ example: 'Taylor Rivera' })
  attendeeName!: string;

  @ApiProperty({ example: 'taylor@example.com' })
  attendeeEmail!: string;

  @ApiProperty({ enum: RegistrationStatus })
  status!: RegistrationStatus;

  @ApiProperty({ example: 2 })
  registeredBy!: number;

  @ApiProperty({ example: '2026-10-09T12:00:00.000Z' })
  registeredAt!: Date;

  @ApiProperty({ example: 2, nullable: true })
  cancelledBy!: number | null;

  @ApiProperty({ example: '2026-10-09T13:00:00.000Z', nullable: true })
  cancelledAt!: Date | null;
}
