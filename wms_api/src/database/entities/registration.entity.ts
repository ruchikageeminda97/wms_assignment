import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { Workshop } from './workshop.entity.js';

export enum RegistrationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'registrations' })
@Index('idx_reg_workshop_status', ['workshopId', 'status'])
export class Registration {
  @PrimaryGeneratedColumn({ name: 'registration_id' })
  id!: number;

  @Column({ name: 'workshop_id', type: 'int' })
  workshopId!: number;

  @ManyToOne(() => Workshop)
  @JoinColumn({ name: 'workshop_id', referencedColumnName: 'id' })
  workshop!: Workshop;

  @Column({ name: 'attendee_name', length: 160 })
  attendeeName!: string;

  @Column({ name: 'attendee_email', length: 255 })
  attendeeEmail!: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.ACTIVE,
  })
  status!: RegistrationStatus;

  @Column({ name: 'registered_by', type: 'int' })
  registeredBy!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by', referencedColumnName: 'id' })
  registrar!: User;

  @CreateDateColumn({ name: 'registered_at', type: 'datetime' })
  registeredAt!: Date;

  @Column({ name: 'cancelled_by', type: 'int', nullable: true })
  cancelledBy!: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by', referencedColumnName: 'id' })
  canceller!: User | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt!: Date | null;

  @Column({
    name: 'active_key',
    type: 'varchar',
    length: 300,
    nullable: true,
    unique: true,
  })
  activeKey!: string | null;
}
