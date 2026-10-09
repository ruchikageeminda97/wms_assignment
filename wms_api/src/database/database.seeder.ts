import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { isEmail } from 'class-validator';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity.js';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email && !password) return;
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured together');
    }
    if (!isEmail(email)) {
      throw new Error('ADMIN_EMAIL must be a valid email address');
    }
    if (password.length < 12 || password.length > 72) {
      throw new Error('ADMIN_PASSWORD must contain between 12 and 72 characters');
    }
    const existing = await this.users.findOne({ where: { email } });
    if (existing) return;
    await this.users.save(
      this.users.create({
        email,
        fullName: this.config.get<string>('ADMIN_FULL_NAME', 'System Administrator'),
        passwordHash: await hash(password, 12),
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
  }
}
