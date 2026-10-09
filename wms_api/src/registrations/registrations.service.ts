import { ConflictException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuthenticatedUser } from '../common/authenticated-user.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { RegistrationQueryDto } from './dto/registration-query.dto.js';
import { RegistrationResponseDto } from './dto/registration-response.dto.js';
import { RegistrationsRepository } from './registrations.repository.js';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly registrations: RegistrationsRepository,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async register(
    dto: CreateRegistrationDto,
    actor: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    try {
      const registration = await this.registrations.register(dto, actor.id);
      await this.auditLogs.record(
        actor.id,
        'registration',
        registration.id,
        'created',
        { workshopId: registration.workshopId },
      );
      return this.toResponse(registration);
    } catch (error) {
      if (this.isDuplicate(error)) {
        throw new ConflictException(
          'This attendee is already registered for the workshop',
        );
      }
      throw error;
    }
  }

  async cancel(
    id: number,
    actor: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    const registration = await this.registrations.cancel(id, actor.id);
    await this.auditLogs.record(
      actor.id,
      'registration',
      id,
      'cancelled',
      { workshopId: registration.workshopId },
    );
    return this.toResponse(registration);
  }

  async listByWorkshop(
    workshopId: number,
    filters: RegistrationQueryDto,
  ): Promise<RegistrationResponseDto[]> {
    return (await this.registrations.listByWorkshop(workshopId, filters)).map(
      (registration) => this.toResponse(registration),
    );
  }

  private toResponse(registration: {
    id: number;
    workshopId: number;
    attendeeName: string;
    attendeeEmail: string;
    status: RegistrationResponseDto['status'];
    registeredBy: number;
    registeredAt: Date;
    cancelledBy: number | null;
    cancelledAt: Date | null;
  }): RegistrationResponseDto {
    return {
      id: registration.id,
      workshopId: registration.workshopId,
      attendeeName: registration.attendeeName,
      attendeeEmail: registration.attendeeEmail,
      status: registration.status,
      registeredBy: registration.registeredBy,
      registeredAt: registration.registeredAt,
      cancelledBy: registration.cancelledBy,
      cancelledAt: registration.cancelledAt,
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
