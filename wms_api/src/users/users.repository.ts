import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
    if (includePassword) query.addSelect('user.passwordHash');
    return query.getOne();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(data));
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
