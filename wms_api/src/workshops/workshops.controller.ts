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
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopResponseDto } from './dto/workshop-response.dto.js';
import { WorkshopsService } from './workshops.service.js';

@ApiTags('workshops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshops: WorkshopsService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a workshop' })
  @ApiCreatedResponse({ type: WorkshopResponseDto })
  create(
    @Body() dto: CreateWorkshopDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<WorkshopResponseDto> {
    return this.workshops.create(dto, actor);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'List workshops with optional date, status, seat, and search filters' })
  @ApiOkResponse({ type: WorkshopResponseDto, isArray: true })
  findAll(@Query() filters: WorkshopQueryDto): Promise<WorkshopResponseDto[]> {
    return this.workshops.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get a workshop and available seat count' })
  @ApiOkResponse({ type: WorkshopResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<WorkshopResponseDto> {
    return this.workshops.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Update workshop details' })
  @ApiOkResponse({ type: WorkshopResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkshopDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<WorkshopResponseDto> {
    return this.workshops.update(id, dto, actor);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel a workshop without deleting it' })
  @ApiOkResponse({ type: WorkshopResponseDto })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<WorkshopResponseDto> {
    return this.workshops.cancel(id, actor);
  }
}
