import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../common/authenticated-user.js';
import { UserRole } from '../database/entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a staff, manager, or admin account' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.users.create(dto, actor);
  }

  @Get()
  @ApiOperation({ summary: 'List all user accounts' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(): Promise<UserResponseDto[]> {
    return this.users.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user account' })
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.users.findOne(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiOkResponse({ type: UserResponseDto })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.users.updateRole(id, dto.role, actor);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user account' })
  @ApiOkResponse({ type: UserResponseDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.users.updateStatus(id, dto.isActive, actor);
  }
}
