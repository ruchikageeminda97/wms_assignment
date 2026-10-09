import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Registration, RegistrationStatus } from '../database/entities/registration.entity.js';
import { Workshop, WorkshopStatus } from '../database/entities/workshop.entity.js';
import { RegistrationQueryDto } from './dto/registration-query.dto.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';

@Injectable()
export class RegistrationsRepository {
  private readonly repository: Repository<Registration>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(Registration);
  }

  async register(
    dto: CreateRegistrationDto,
    registeredBy: number,
  ): Promise<Registration> {
    const attendeeEmail = dto.attendeeEmail.trim().toLowerCase();
    return this.dataSource.transaction(async (manager) => {
      const workshops = manager.getRepository(Workshop);
      const workshop = await workshops.findOne({
        where: { id: dto.workshopId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!workshop) throw new NotFoundException('Workshop not found');
      if (workshop.status !== WorkshopStatus.SCHEDULED) {
        throw new ConflictException('Registrations are closed for this workshop');
      }
      const registrations = manager.getRepository(Registration);
      const duplicate = await registrations.findOne({
        where: {
          workshopId: workshop.id,
          attendeeEmail,
          status: RegistrationStatus.ACTIVE,
        },
      });
      if (duplicate) {
        throw new ConflictException('This attendee is already registered for the workshop');
      }
      if (workshop.activeCount >= workshop.capacity) {
        throw new ConflictException('The workshop has no available seats');
      }
      const registration = registrations.create({
        workshopId: workshop.id,
        attendeeName: dto.attendeeName.trim(),
        attendeeEmail,
        status: RegistrationStatus.ACTIVE,
        registeredBy,
        cancelledBy: null,
        cancelledAt: null,
        activeKey: `${workshop.id}:${attendeeEmail}`,
      });
      workshop.activeCount += 1;
      await registrations.save(registration);
      await workshops.save(workshop);
      return registration;
    });
  }

  async cancel(id: number, cancelledBy: number): Promise<Registration> {
    return this.dataSource.transaction(async (manager) => {
      const registrations = manager.getRepository(Registration);
      const registration = await registrations.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!registration) throw new NotFoundException('Registration not found');
      if (registration.status !== RegistrationStatus.ACTIVE) {
        throw new ConflictException('Registration is already cancelled');
      }
      const workshops = manager.getRepository(Workshop);
      const workshop = await workshops.findOne({
        where: { id: registration.workshopId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!workshop) throw new NotFoundException('Workshop not found');
      registration.status = RegistrationStatus.CANCELLED;
      registration.cancelledBy = cancelledBy;
      registration.cancelledAt = new Date();
      registration.activeKey = null;
      workshop.activeCount = Math.max(0, workshop.activeCount - 1);
      await registrations.save(registration);
      await workshops.save(workshop);
      return registration;
    });
  }

  async listByWorkshop(
    workshopId: number,
    filters: RegistrationQueryDto,
  ): Promise<Registration[]> {
    const workshop = await this.dataSource
      .getRepository(Workshop)
      .findOne({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    const query = this.repository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.registrar', 'registrar')
      .leftJoinAndSelect('registration.canceller', 'canceller')
      .where('registration.workshopId = :workshopId', { workshopId });
    if (filters.status) {
      query.andWhere('registration.status = :status', { status: filters.status });
    }
    return query.orderBy('registration.registeredAt', 'DESC').getMany();
  }
}
