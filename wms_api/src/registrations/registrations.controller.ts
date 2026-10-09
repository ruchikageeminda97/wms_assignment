import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/authenticated-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UserRole } from '../database/entities/user.entity.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { RegistrationQueryDto } from './dto/registration-query.dto.js';
import { RegistrationResponseDto } from './dto/registration-response.dto.js';
import { RegistrationsService } from './registrations.service.js';

@ApiTags('registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.STAFF)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register an attendee without exceeding workshop capacity' })
  @ApiCreatedResponse({ type: RegistrationResponseDto })
  create(
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    return this.registrations.register(dto, actor);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a registration and retain its audit history' })
  @ApiOkResponse({ type: RegistrationResponseDto })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    return this.registrations.cancel(id, actor);
  }

  @Get('workshop/:workshopId')
  @ApiOperation({ summary: 'List registration history for a workshop' })
  @ApiOkResponse({ type: RegistrationResponseDto, isArray: true })
  findByWorkshop(
    @Param('workshopId', ParseIntPipe) workshopId: number,
    @Query() filters: RegistrationQueryDto,
  ): Promise<RegistrationResponseDto[]> {
    return this.registrations.listByWorkshop(workshopId, filters);
  }
}
