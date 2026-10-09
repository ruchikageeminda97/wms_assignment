import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuthenticatedUser } from '../common/authenticated-user.js';
import { Workshop, WorkshopStatus } from '../database/entities/workshop.entity.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopResponseDto } from './dto/workshop-response.dto.js';
import { WorkshopsRepository } from './workshops.repository.js';

@Injectable()
export class WorkshopsService {
  constructor(
    private readonly workshops: WorkshopsRepository,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateWorkshopDto, actor: AuthenticatedUser): Promise<WorkshopResponseDto> {
    try {
      const workshop = await this.workshops.create({
        ...dto,
        code: dto.code.trim().toUpperCase(),
        title: dto.title.trim(),
        instructor: dto.instructor.trim(),
        location: dto.location.trim(),
        startAt: new Date(dto.startAt),
        createdBy: actor.id,
        activeCount: 0,
        status: WorkshopStatus.SCHEDULED,
      });
      await this.auditLogs.record(actor.id, 'workshop', workshop.id, 'created', {
        code: workshop.code,
      });
      return this.toResponse(workshop);
    } catch (error) {
      if (this.isDuplicate(error)) {
        throw new ConflictException('A workshop with this code already exists');
      }
      throw error;
    }
  }

  async findAll(filters: WorkshopQueryDto): Promise<WorkshopResponseDto[]> {
    return (await this.workshops.list(filters)).map((item) => this.toResponse(item));
  }

  async findOne(id: number): Promise<WorkshopResponseDto> {
    return this.toResponse(await this.requireWorkshop(id));
  }

  async update(
    id: number,
    dto: UpdateWorkshopDto,
    actor: AuthenticatedUser,
  ): Promise<WorkshopResponseDto> {
    const workshop = await this.requireWorkshop(id);
    if (dto.capacity !== undefined && dto.capacity < workshop.activeCount) {
      throw new ConflictException(
        `Capacity cannot be less than the ${workshop.activeCount} active registrations`,
      );
    }
    const previous = {
      title: workshop.title,
      instructor: workshop.instructor,
      startAt: workshop.startAt,
      location: workshop.location,
      capacity: workshop.capacity,
    };
    if (dto.code !== undefined) workshop.code = dto.code.trim().toUpperCase();
    if (dto.title !== undefined) workshop.title = dto.title.trim();
    if (dto.instructor !== undefined) workshop.instructor = dto.instructor.trim();
    if (dto.startAt !== undefined) workshop.startAt = new Date(dto.startAt);
    if (dto.location !== undefined) workshop.location = dto.location.trim();
    if (dto.capacity !== undefined) workshop.capacity = dto.capacity;
    try {
      await this.workshops.save(workshop);
    } catch (error) {
      if (this.isDuplicate(error)) {
        throw new ConflictException('A workshop with this code already exists');
      }
      throw error;
    }
    await this.auditLogs.record(actor.id, 'workshop', id, 'updated', {
      previous,
      updated: dto,
    });
    return this.toResponse(workshop);
  }

  async cancel(id: number, actor: AuthenticatedUser): Promise<WorkshopResponseDto> {
    const workshop = await this.requireWorkshop(id);
    if (workshop.status === WorkshopStatus.CANCELLED) {
      throw new ConflictException('Workshop is already cancelled');
    }
    workshop.status = WorkshopStatus.CANCELLED;
    await this.workshops.save(workshop);
    await this.auditLogs.record(actor.id, 'workshop', id, 'cancelled', null);
    return this.toResponse(workshop);
  }

  private async requireWorkshop(id: number): Promise<Workshop> {
    const workshop = await this.workshops.findById(id);
    if (!workshop) throw new NotFoundException('Workshop not found');
    return workshop;
  }

  private toResponse(workshop: Workshop): WorkshopResponseDto {
    return {
      id: workshop.id,
      code: workshop.code,
      title: workshop.title,
      instructor: workshop.instructor,
      startAt: workshop.startAt,
      location: workshop.location,
      capacity: workshop.capacity,
      activeCount: workshop.activeCount,
      seatsAvailable: workshop.capacity - workshop.activeCount,
      status: workshop.status,
      createdBy: workshop.createdBy,
      createdAt: workshop.createdAt,
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
