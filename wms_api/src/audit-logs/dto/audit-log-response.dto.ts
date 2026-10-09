import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 2 })
  actorId!: number;

  @ApiProperty({ example: 'workshop' })
  entityType!: string;

  @ApiProperty({ example: 17 })
  entityId!: number;

  @ApiProperty({ example: 'updated' })
  action!: string;

  @ApiProperty({ type: Object, nullable: true, example: { capacity: 25 } })
  details!: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-10-09T12:00:00.000Z' })
  createdAt!: Date;
}
