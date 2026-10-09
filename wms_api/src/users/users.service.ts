import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuthenticatedUser } from '../common/authenticated-user.js';
import { User } from '../database/entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateUserDto, actor: AuthenticatedUser): Promise<UserResponseDto> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('A user with this email already exists');
    }
    let user: User;
    try {
      user = await this.users.create({
        email,
        fullName: dto.fullName.trim(),
        passwordHash: await hash(dto.password, 12),
        role: dto.role,
        isActive: true,
      });
    } catch (error) {
      if (this.isDuplicate(error)) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
    await this.auditLogs.record(actor.id, 'user', user.id, 'created', {
      email: user.email,
      role: user.role,
    });
    return this.toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return (await this.users.findAll()).map((user) => this.toResponse(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    return this.toResponse(await this.requireUser(id));
  }

  async updateRole(
    id: number,
    role: User['role'],
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.requireUser(id);
    const previousRole = user.role;
    user.role = role;
    await this.users.save(user);
    await this.auditLogs.record(actor.id, 'user', user.id, 'role_updated', {
      previousRole,
      role,
    });
    return this.toResponse(user);
  }

  async updateStatus(
    id: number,
    isActive: boolean,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.requireUser(id);
    const previousStatus = user.isActive;
    user.isActive = isActive;
    await this.users.save(user);
    await this.auditLogs.record(actor.id, 'user', user.id, 'status_updated', {
      previousStatus,
      isActive,
    });
    return this.toResponse(user);
  }

  private async requireUser(id: number): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  private isDuplicate(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
