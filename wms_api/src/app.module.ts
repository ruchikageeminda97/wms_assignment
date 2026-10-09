import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuditLog } from './database/entities/audit-log.entity.js';
import { Registration } from './database/entities/registration.entity.js';
import { DatabaseSeeder } from './database/database.seeder.js';
import { User } from './database/entities/user.entity.js';
import { Workshop } from './database/entities/workshop.entity.js';
import { RegistrationsModule } from './registrations/registrations.module.js';
import { UsersModule } from './users/users.module.js';
import { WorkshopsModule } from './workshops/workshops.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get<string>('DB_PORT', '3306'));
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('DB_PORT must be an integer between 1 and 65535');
        }
        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port,
          username: config.get<string>('DB_USER', 'root'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_NAME', 'wms_db'),
          entities: [User, Workshop, Registration, AuditLog],
          autoLoadEntities: true,
          synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        };
      },
    }),
    AuthModule,
    UsersModule,
    WorkshopsModule,
    RegistrationsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeeder],
})
export class AppModule {}
