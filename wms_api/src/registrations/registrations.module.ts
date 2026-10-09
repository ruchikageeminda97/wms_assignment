import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Registration } from '../database/entities/registration.entity.js';
import { User } from '../database/entities/user.entity.js';
import { Workshop } from '../database/entities/workshop.entity.js';
import { RegistrationsController } from './registrations.controller.js';
import { RegistrationsRepository } from './registrations.repository.js';
import { RegistrationsService } from './registrations.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration, Workshop, User]),
    AuditLogsModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsRepository, RegistrationsService, RolesGuard],
})
export class RegistrationsModule {}
