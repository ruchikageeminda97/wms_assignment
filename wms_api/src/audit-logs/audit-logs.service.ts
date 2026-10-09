import { Injectable } from '@nestjs/common';
import { AuditLog } from '../database/entities/audit-log.entity.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { AuditLogResponseDto } from './dto/audit-log-response.dto.js';
import { AuditLogsRepository } from './audit-logs.repository.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly logs: AuditLogsRepository) {}

  async record(
    actorId: number,
    entityType: string,
    entityId: number,
    action: string,
    details: Record<string, unknown> | null,
  ): Promise<void> {
    await this.logs.create({ actorId, entityType, entityId, action, details });
  }

  async list(filters: AuditLogQueryDto): Promise<AuditLogResponseDto[]> {
    return (await this.logs.list(filters)).map((log: AuditLog) => ({
      id: log.id,
      actorId: log.actorId,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
    }));
  }
}
