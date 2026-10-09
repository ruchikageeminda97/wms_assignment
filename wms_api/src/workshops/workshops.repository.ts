import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Workshop } from '../database/entities/workshop.entity.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';

@Injectable()
export class WorkshopsRepository {
  constructor(
    @InjectRepository(Workshop)
    private readonly repository: Repository<Workshop>,
  ) {}

  async list(filters: WorkshopQueryDto): Promise<Workshop[]> {
    const query = this.repository.createQueryBuilder('workshop');
    this.applyFilters(query, filters);
    return query.orderBy('workshop.startAt', 'ASC').getMany();
  }

  findById(id: number): Promise<Workshop | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(workshop: Partial<Workshop>): Promise<Workshop> {
    return this.repository.save(this.repository.create(workshop));
  }

  async save(workshop: Workshop): Promise<Workshop> {
    return this.repository.save(workshop);
  }

  private applyFilters(
    query: SelectQueryBuilder<Workshop>,
    filters: WorkshopQueryDto,
  ): void {
    if (filters.from) {
      query.andWhere('workshop.startAt >= :from', {
        from: `${filters.from} 00:00:00`,
      });
    }
    if (filters.to) {
      query.andWhere('workshop.startAt < DATE_ADD(:to, INTERVAL 1 DAY)', {
        to: `${filters.to} 00:00:00`,
      });
    }
    if (filters.status) {
      query.andWhere('workshop.status = :status', { status: filters.status });
    }
    if (filters.hasSeats) {
      query.andWhere('workshop.capacity > workshop.activeCount');
    }
    if (filters.hasSeats === false) {
      query.andWhere('workshop.capacity <= workshop.activeCount');
    }
    if (filters.search?.trim()) {
      query.andWhere(
        '(workshop.code LIKE :search OR workshop.title LIKE :search OR workshop.instructor LIKE :search)',
        { search: `%${filters.search.trim()}%` },
      );
    }
  }
}
