import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities/audit-log.entity.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuditLogsController } from './audit-logs.controller.js';
import { AuditLogsRepository } from './audit-logs.repository.js';
import { AuditLogsService } from './audit-logs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditLogsRepository, AuditLogsService, RolesGuard],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
