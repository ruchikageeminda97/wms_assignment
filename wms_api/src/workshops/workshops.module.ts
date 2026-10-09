import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { Workshop } from '../database/entities/workshop.entity.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { WorkshopsController } from './workshops.controller.js';
import { WorkshopsRepository } from './workshops.repository.js';
import { WorkshopsService } from './workshops.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop]), AuditLogsModule],
  controllers: [WorkshopsController],
  providers: [WorkshopsRepository, WorkshopsService, RolesGuard],
})
export class WorkshopsModule {}
