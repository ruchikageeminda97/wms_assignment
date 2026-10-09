import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { User } from '../database/entities/user.entity.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuditLogsModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, RolesGuard],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
