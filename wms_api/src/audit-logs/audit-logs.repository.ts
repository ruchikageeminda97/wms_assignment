import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';

@Injectable()
export class AuditLogsRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(log: Partial<AuditLog>): Promise<AuditLog> {
    return this.repository.save(this.repository.create(log));
  }

  async list(filters: AuditLogQueryDto): Promise<AuditLog[]> {
    const query = this.repository.createQueryBuilder('audit');
    this.applyFilters(query, filters);
    return query.orderBy('audit.createdAt', 'DESC').getMany();
  }

  private applyFilters(
    query: SelectQueryBuilder<AuditLog>,
    filters: AuditLogQueryDto,
  ): void {
    if (filters.entityType) {
      query.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }
    if (filters.userId) {
      query.andWhere('audit.actorId = :userId', { userId: filters.userId });
    }
    if (filters.from) {
      query.andWhere('audit.createdAt >= :from', {
        from: `${filters.from} 00:00:00`,
      });
    }
    if (filters.to) {
      const toExclusive = new Date(`${filters.to}T00:00:00.000Z`);
      toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
      query.andWhere('audit.createdAt < :toExclusive', { toExclusive });
    }
    query.take(500);
  }
}
