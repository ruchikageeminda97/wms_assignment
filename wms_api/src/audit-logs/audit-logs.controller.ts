import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UserRole } from '../database/entities/user.entity.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { AuditLogResponseDto } from './dto/audit-log-response.dto.js';
import { AuditLogsService } from './audit-logs.service.js';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit events with optional filters, capped at 500 records' })
  @ApiOkResponse({ type: AuditLogResponseDto, isArray: true })
  findAll(
    @Query() filters: AuditLogQueryDto,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditLogs.list(filters);
  }
}
